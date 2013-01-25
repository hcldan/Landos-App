package com.ibm.opensocial.landos;

import java.io.IOException;
import java.io.StringWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.wink.json4j.JSONWriter;

import com.google.common.base.Strings;

public class RunServlet extends BaseServlet {
  private static final long serialVersionUID = 2718572285038956077L;
  private static final String CLAZZ = RunServlet.class.getName();
  private static final Logger LOGGER = Logger.getLogger(CLAZZ);

  /**
   * Gets information about a particular run given an ID.
   * 
   * @throws IOException
   */
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
    setCacheAndTypeHeaders(res);
    String id = getPathSegment(req, 0);

    // Create JSON writer
    JSONWriter writer = getJSONWriter(res).object();

    // Prepare database variables
    Connection connection = null;
    PreparedStatement stmt = null;
    ResultSet result = null;

    try {
      // Get connection
      connection = getDataSource(req).getConnection();
      
      if (Strings.isNullOrEmpty(id)) {
        stmt = connection.prepareStatement("SELECT * FROM `runs` WHERE NOW() BETWEEN `start` AND `end`");
        result = stmt.executeQuery();
        if (result.first()) {
          writeRun(writer, result.getInt(1), result.getTimestamp(2), result.getTimestamp(3), result.getBoolean(4));
        } else {
          writer.key("error").value("Could find active run.").endObject();
        }
      } else {
        int intid = Integer.parseInt(id);
        stmt = connection.prepareStatement("SELECT * FROM runs WHERE id = ?");
        stmt.setInt(1, intid);
        result = stmt.executeQuery();
        if (result.first()) {
          writeRun(writer, intid, result.getTimestamp(2), result.getTimestamp(3), result.getBoolean(4));
          return;
        } else {
          writer.key("error").value("Could not get run " + id).endObject();
        }
      }
    } catch (Exception e) {
      LOGGER.logp(Level.SEVERE, CLAZZ, "doGet", e.getMessage());
    } finally {
      close(result, stmt, connection, writer);
    }
  }

  /**
   * Creates a new run given a start date, an end date, and (optionally) whether the run is a test.
   * 
   * @throws IOException
   */
  @Override
  protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
    setCacheAndTypeHeaders(res);

    // Create JSON Writer
    JSONWriter writer = getJSONWriter(res).object();
    try {
      // Check admin status.
      try {
        if (!isAdmin(req, getUser(req))) {
          res.setStatus(403);
          writer.key("error").value("Not authorized").endObject();
          return;
        }
      } catch (Exception e) {
        LOGGER.logp(Level.SEVERE, CLAZZ, "doPut", e.getMessage());
        throw new IOException(e);
      }

      // Parse arguments
      Timestamp start = new Timestamp(Long.parseLong(getPathSegment(req, 0)));
      Timestamp end = new Timestamp(Long.parseLong(getPathSegment(req, 1)));
      String testSegment = getPathSegment(req, 2);
      boolean test = testSegment != null && testSegment.equals("1");

      // Check start and end times
      if (end.before(start)) {
        res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        try {
          writer.key("error").value("Start time must be before end time.").endObject();
        } catch (Exception e) {
          LOGGER.logp(Level.SEVERE, CLAZZ, "doPut", e.getMessage());
        }
        return;
      }

      // Prepare database variables
      Connection conn = null;
      PreparedStatement stmt = null;
      ResultSet result = null, ids = null;

      try {
        // Get connection
        conn = getDataSource(req).getConnection();
        // Check for overlaps
        stmt = conn
                .prepareStatement("SELECT COUNT(*) FROM runs WHERE ? <= end AND ? >= start");
        stmt.setTimestamp(1, start);
        stmt.setTimestamp(2, end);
        result = stmt.executeQuery();
        if (result.first() && result.getInt(1) > 0) {
          writer.key("error").value("There is already a run within the specified time range.")
                  .endObject();
          return;
        }
        // Insert into database
        stmt = conn.prepareStatement("INSERT INTO runs VALUES (NULL, ?, ?, ?)",
                Statement.RETURN_GENERATED_KEYS);
        stmt.setTimestamp(1, start);
        stmt.setTimestamp(2, end);
        stmt.setBoolean(3, test);
        stmt.executeUpdate();
        int insertedId = 0;
        ids = stmt.getGeneratedKeys();
        if (ids.first()) {
          insertedId = ids.getInt(1);
        }
        // Write back to client
        writeRun(writer, insertedId, start, end, test);
        // Send email
        sendEmails(req, conn, insertedId, start, end, test);
      } catch (Exception e) {
        LOGGER.logp(Level.SEVERE, CLAZZ, "doPut", e.getMessage());
      } finally {
        close(ids, result, stmt, conn);
      } 
    } finally {
      close(writer);
    }
  }

  /**
   * Deletes a particular run given an ID.
   * 
   * @throws IOException
   */
  @Override
  protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
    setCacheAndTypeHeaders(res);
    
    JSONWriter writer = getJSONWriter(res).object();
    try { 
      // Check admin status.
      try {
        if (!isAdmin(req, getUser(req))) {
          res.setStatus(403);
          writer.key("error").value("Not authorized").endObject();
          return;
        }
      } catch (Exception e) {
        LOGGER.logp(Level.SEVERE, CLAZZ, "doPut", e.getMessage());
        throw new IOException(e);
      }
  
      int id = Integer.parseInt(getPathSegment(req, 0));
      
      // Prepare database variables
      Connection connection = null;
      PreparedStatement stmt = null;
      int result = 0;
  
      try {
        // Get connection
        connection = getDataSource(req).getConnection();
        // Check for overlaps
        stmt = connection.prepareStatement("DELETE FROM runs WHERE id = ?");
        stmt.setInt(1, id);
        result = stmt.executeUpdate();
        // Write result
        if (result > 0) {
          writer.key("id").value(id).endObject();
        } else {
          writer.key("error").value("Could not delete " + id);
        }
      } catch (Exception e) {
        LOGGER.logp(Level.SEVERE, CLAZZ, "doDelete", e.getMessage());
      } finally {
        close(stmt, connection);
      }
    } finally {
      close(writer);
    }
  }

  /**
   * Writes a run object.
   * 
   * @param writer
   *          The JSONWriter to use.
   * @param id
   *          The id of the run.
   * @param start
   *          The start time of the run.
   * @param end
   *          The end time of the run.
   * @param test
   *          Boolean indicating if this run is a test.
   * @throws IOException
   */
  private void writeRun(JSONWriter writer, int id, Timestamp start, Timestamp end, boolean test)
          throws IOException {
    writer.key("id").value(id).key("start").value(start.getTime()).key("end").value(end.getTime())
            .key("test").value(test).endObject();
  }
  
  /**
   * Sends an email containing an embedded experience.
   * @param req
   * @param conn SQL Connection to use for getting subscribers. MUST BE CLOSED BY THE CALLER OF THIS METHOD.
   * @param id
   * @param start
   * @param end
   * @param test
   * @throws MessagingException 
   */
  private void sendEmails(HttpServletRequest req, Connection conn, int id, Timestamp start, Timestamp end, boolean test) {
    // Get email addresses to send to
    List<InternetAddress> emails = new LinkedList<InternetAddress>();

    try {
      // Get users from database
      PreparedStatement stmt = conn.prepareStatement(test ? "SELECT `user` FROM `subscribed` WHERE `test`=1" : "SELECT `user` FROM `subscribed` WHERE 1");
      ResultSet results = stmt.executeQuery();
      // Place email into list
      while (results.next()) {
        emails.add(new InternetAddress(getEmailForUser(results.getString(1))));
      }
    } catch (Exception e) {
      LOGGER.logp(Level.SEVERE, CLAZZ, "sendEmails", e.getMessage());
    }
    
    try {
      // Get session
      Context initCtx = new InitialContext();
      Context envCtx = (Context) initCtx.lookup("java:comp/env");
      Session session = (Session) envCtx.lookup("mail/Session");
      
      // MimeMessage
      MimeMessage msg = new MimeMessage(session);
      msg.setFrom(new InternetAddress("\"" + getEmailForUser(getUser(req)) + "\" <ddumont@us.ibm.com>"));
      msg.setRecipients(Message.RecipientType.BCC, emails.toArray(new InternetAddress[]{}));
      msg.setSubject("New Lando's Run!");
      msg.setSentDate(new Date());
      
      // Build multipart message
      MimeMultipart mmp = new MimeMultipart("alternative");

      // Create message
      String startString = start.toString();
      String endString = end.toString();
      String message = "A new Lando's run has been created! The run id is " + id
              + ". You may order food bewteen " + startString + " and " + endString
              + " by opening up the Lando's app.";

      // Create the text part
      MimeBodyPart mbp1 = new MimeBodyPart();
      mbp1.setContent(message, "text/plain");
      mmp.addBodyPart(mbp1);

      // Create the html part
      MimeBodyPart mbp2 = new MimeBodyPart();
      mbp2.setContent(message, "text/html");
      mmp.addBodyPart(mbp2);
      
      // Create the application/embed+json part
      MimeBodyPart mbp3 = new MimeBodyPart();
      
      StringWriter payload = new StringWriter();
      new JSONWriter(payload).object()
        .key("gadget").value(getEEUrl(req))
        .key("context").object()
          .key("runid").value(id)
          .key("start").value(start.getTime())
          .key("end").value(end.getTime())
        .endObject()
      .endObject().flush().close();
      mbp3.setContent(payload.toString(), "application/embed+json");
      mmp.addBodyPart(mbp3);
      
      // Set message content
      msg.setContent(mmp);
      
      // Send the message
      Transport.send(msg);
    } catch (Exception e) {
      LOGGER.log(Level.SEVERE, "Could not send mail message.", e);
    }
  }
}
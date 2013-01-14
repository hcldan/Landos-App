package com.ibm.opensocial.landos;

import org.apache.wink.json4j.JSONWriter;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class RunServlet extends BaseServlet {
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
    int id = getId(req);

    // Create JSON writer
    JSONWriter writer = getJSONWriter(res).object();

    // Prepare database variables
    Connection connection = null;
    PreparedStatement stmt = null;
    ResultSet result = null;

    try {
      // Get connection
      connection = getDataSource(req).getConnection();
      // Check for overlaps
      stmt = connection.prepareStatement("SELECT * FROM runs WHERE id = ?");
      stmt.setInt(1, id);
      result = stmt.executeQuery();
      if (result.first()) {
        writeRun(writer, id, result.getTimestamp(2), result.getTimestamp(3), result.getBoolean(4));
        return;
      } else {
        writer.key("error").value("Could not get run " + id).endObject();
      }
    } catch (Exception e) {
      LOGGER.logp(Level.SEVERE, CLAZZ, "doGet", e.getMessage());
    } finally {
      close(connection, writer);
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

    // Parse arguments
    Timestamp start = new Timestamp(Long.parseLong(getPathSegment(req, 0)));
    Timestamp end = new Timestamp(Long.parseLong(getPathSegment(req, 1)));
    String testSegment = getPathSegment(req, 2);
    boolean test = testSegment != null && testSegment.equals("1");

    // Create JSON Writer
    JSONWriter writer = getJSONWriter(res).object();

    // Check start and end times
    if (end.before(start)) {
      res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      try {
        writer.key("error").value("Start time must be before end time.").endObject();
      } catch (Exception e) {
        LOGGER.logp(Level.SEVERE, CLAZZ, "doPut", e.getMessage());
      } finally {
        writer.close();
      }
      return;
    }

    // Prepare database variables
    Connection connection = null;
    PreparedStatement pstat = null;
    ResultSet result = null;

    try {
      // Get connection
      connection = getDataSource(req).getConnection();
      // Check for overlaps
      pstat = connection
              .prepareStatement("SELECT COUNT(*) FROM runs WHERE ? <= end AND ? >= start");
      pstat.setTimestamp(1, start);
      pstat.setTimestamp(2, end);
      result = pstat.executeQuery();
      if (result.first() && result.getInt(1) > 0) {
        writer.key("error").value("There is already a run within the specified time range.")
                .endObject();
        return;
      }
      // Insert into database
      pstat = connection.prepareStatement("INSERT INTO runs VALUES (NULL, ?, ?, ?)",
              Statement.RETURN_GENERATED_KEYS);
      pstat.setTimestamp(1, start);
      pstat.setTimestamp(2, end);
      pstat.setBoolean(3, test);
      pstat.executeUpdate();
      int insertedId = 0;
      ResultSet ids = pstat.getGeneratedKeys();
      if (ids.first()) {
        insertedId = ids.getInt(1);
      }
      // Write back to client
      writeRun(writer, insertedId, start, end, test);
    } catch (Exception e) {
      LOGGER.logp(Level.SEVERE, CLAZZ, "doPut", e.getMessage());
    } finally {
      close(connection, writer);
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
    int id = getId(req);
    JSONWriter writer = getJSONWriter(res).object();

    // Prepare database variables
    Connection connection = null;
    PreparedStatement pstat = null;
    int result = 0;

    try {
      // Get connection
      connection = getDataSource(req).getConnection();
      // Check for overlaps
      pstat = connection.prepareStatement("DELETE FROM runs WHERE id = ?");
      pstat.setInt(1, id);
      result = pstat.executeUpdate();
      // Write result
      if (result > 0) {
        writer.key("id").value(id).endObject();
      } else {
        writer.key("error").value("Could not delete " + id);
      }
    } catch (Exception e) {
      LOGGER.logp(Level.SEVERE, CLAZZ, "doDelete", e.getMessage());
    } finally {
      close(connection, writer);
    }
  }

  /**
   * Gets the id from a request.
   * 
   * @param req
   *          The request to get the id from.
   * @return The id from the request
   */
  private int getId(HttpServletRequest req) {
    return Integer.parseInt(getPathSegment(req, 0));
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
}
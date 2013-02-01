package com.ibm.opensocial.landos;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONWriter;

import com.google.common.base.Strings;

public class OrdersServlet extends BaseServlet {
  private static final long serialVersionUID = 4509166979070691855L;
  private static final String CLAZZ = OrdersServlet.class.getName();
  private static final Logger LOGGER = Logger.getLogger(CLAZZ);
  
  /**
   * GET /orders/[<runid>[/<orderid>]][?user=<user>]
   * @throws IOException 
   */
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
    // Set headers
    setCacheAndTypeHeaders(res);
    
    // Get the run id and order id
    String rid = getPathSegment(req, 0);
    // Get the order id
    String order = getPathSegment(req, 1);
    
    // Get the user and item parameters (if any)
    String user = req.getParameter("user");
    
    // Prepare database variables
    Connection conn = null;
    PreparedStatement stmt = null;
    ResultSet results = null;
    
    // Writer
    JSONWriter writer = getJSONWriter(res);
    
    // Query
    String query = "SELECT * FROM orders WHERE ";
    
    try {
      conn = getDataSource(req).getConnection();
      // Parameter control forks
      if (!Strings.isNullOrEmpty(order)) {
        stmt = conn.prepareStatement(query + "id = ?");
        stmt.setInt(1, Integer.parseInt(order, 10));
      } else if (Strings.isNullOrEmpty(user)) {
        // User is not set
        stmt = conn.prepareStatement(query + "rid = ?");
        stmt.setInt(1, Integer.parseInt(rid, 10));
      } else {
        // User is set
        stmt = conn.prepareStatement(query + "rid = ? AND user = ?");
        stmt.setInt(1, Integer.parseInt(rid, 10));
        stmt.setInt(2, Integer.parseInt(user, 10));
      }
      // Prepared statement is now ready for execution
      results = stmt.executeQuery();
      writer.array();
      while (results.next()) {
        writeJSONObjectOrder(writer, results.getInt(1), results.getInt(2), results.getString(3), results.getString(4), results.getString(5), results.getInt(6), results.getString(7));
      }
      writer.endArray();
    } catch (Exception e) {
      LOGGER.logp(Level.SEVERE, CLAZZ, "doGet", e.getMessage());
    } finally {
      close(writer, conn);
    }
  }
  
  /**
   * DELETE /orders/<runid>/<orderid>
   * @throws IOException 
   */
  @Override
  public void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
    // Set headers
    setCacheAndTypeHeaders(res);
    
    // Writer
    JSONWriter writer = getJSONWriter(res);
    
    // Check for required parameters
    if (numSegments(req) < 2) {
      try {
        writer.object().key("error").value("Deleting requires a run id and an order id.");
      } catch (Exception e) {
        LOGGER.logp(Level.SEVERE, CLAZZ, "doDelete", e.getMessage());
      } finally {
        close(writer);
      }
      return;
    }
    
    // Get the run id and order id, the run id is just for verification -- the primary key is just the order id
    String rid = getPathSegment(req, 0);
    String order = getPathSegment(req, 1);
    
    // Prepare database variables
    Connection conn = null;
    PreparedStatement stmt = null;
    
    // Query
    String query = "DELETE FROM orders WHERE ";
    try {
      conn = getDataSource(req).getConnection();
      stmt = conn.prepareStatement(query + "id = ? AND rid = ?");
      stmt.setInt(1, Integer.parseInt(order, 10));
      stmt.setInt(2, Integer.parseInt(rid, 10));
      writer.object();
      writer.key("delete").value(stmt.executeUpdate());
      writer.endObject();
    } catch (Exception e) {
      LOGGER.logp(Level.SEVERE, CLAZZ, "doDelete", e.getMessage());
    } finally {
      close(writer, conn);
    }
  }
  
  /**
   * PUT /orders/<runid>?user=<user>&item=<item>&price=<price>[&size=<size>][&comments=<comments>]
   * @throws IOException 
   */
  @Override
  public void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
    // Set headers
    setCacheAndTypeHeaders(res);
    // Get the order id
    String order = getPathSegment(req, 1);
    
    // Get required parameters
    String run = getPathSegment(req, 0);
    String user = req.getParameter("user");
    String item = req.getParameter("item");
    String price = req.getParameter("price");
    
    // Get optional parameters
    String size = req.getParameter("size");
    String comments = req.getParameter("comments");
    
    // Writer
    JSONWriter writer = getJSONWriter(res);
    
    // Check for required parameters
    if (req == null || user == null || item == null || price == null) {
      try {
        writer.object().key("error").value("Putting requires a run id, an user id, an item, and a price.");
      } catch (Exception e) {
        LOGGER.logp(Level.SEVERE, CLAZZ, "doDelete", e.getMessage());
      } finally {
        close(writer);
      }
      return;
    }
    
    // Prepare database variables
    Connection conn = null;
    PreparedStatement stmt = null;
    ResultSet result = null;
    
    boolean hasOrderId = !Strings.isNullOrEmpty(order);
    // Query
    StringBuilder query = new StringBuilder("INSERT INTO `orders` ");
    query.append("(`rid`,`user`,`item`,`size`,`price`,`comments`").append(!hasOrderId ? ") " : ",`id`) ");
    query.append("VALUES (?,?,?,?,?,?");
    if (!hasOrderId) {
      query.append(") "); 
    } else {
      query.append(",`id`) ON DUPLICATE KEY UPDATE ")
      .append("`rid`=VALUES(`rid`),`user`=VALUES(`user`),`item`=VALUES(`item`),`size`=VALUES(`size`),`price`=VALUES(`price`),`comments`=VALUES(`comments`)");
    }
    
    try {
      // Prepare variables
      int rid = Integer.parseInt(run);
      int cents = Integer.parseInt(price);
      
      // Insert into database
      conn = getDataSource(req).getConnection();
      stmt = conn.prepareStatement(query.toString(), PreparedStatement.RETURN_GENERATED_KEYS);
      stmt.setInt(1, rid);
      stmt.setString(2, user);
      stmt.setString(3, item);
      stmt.setString(4, size);
      stmt.setInt(5, cents);
      stmt.setString(6, comments);
      
      int affected = stmt.executeUpdate();
      if (!hasOrderId) {
        result = stmt.getGeneratedKeys();
        result.first();
        order = Integer.toString(result.getInt(1), 10);
      }
      
      // Write back
      if (affected > 0 && !Strings.isNullOrEmpty(order)) {
        writeJSONObjectOrder(writer, Integer.valueOf(order, 10), rid, user, item, size, cents, comments);
      } else {
        writer.object()
          .key("error").value("Did not insert order.")
        .endObject();
      }
    } catch (Exception e) {
      LOGGER.logp(Level.SEVERE, CLAZZ, "doPut", e.getMessage());
    } finally {
      close(result, stmt, conn, writer);
    }
  }
  
  /**
   * Writes the values of an order to a JSON object
   * @param writer
   * @param rid
   * @param user
   * @param item
   * @param size
   * @param qty
   * @param price
   * @param comments
   * @throws JSONException 
   * @throws IOException 
   * @throws NullPointerException 
   * @throws IllegalStateException 
   */
  private void writeJSONObjectOrder(JSONWriter writer, int id, int rid, String user, String item, String size, int price, String comments) throws IllegalStateException, NullPointerException, IOException, JSONException {
    writer.object()
      .key("id").value(id)
      .key("rid").value(rid)
      .key("user").value(user)
      .key("item").value(item)
      .key("size").value(size)
      .key("price").value(price)
      .key("comments").value(comments)
    .endObject();
  }
}

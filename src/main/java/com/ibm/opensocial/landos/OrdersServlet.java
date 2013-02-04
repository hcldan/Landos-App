package com.ibm.opensocial.landos;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
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
  private final static int DEFAULT_ORDER_LIMIT = 25;

  /**
   * GET /orders/[<runid>[/<orderid>]][?user=<user>]
   * 
   * @throws IOException
   */
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
    // Set headers
    setCacheAndTypeHeaders(res);

    // Get the run id, order id, and user
    String rid = getPathSegment(req, 0);
    boolean ridSet = !Strings.isNullOrEmpty(rid);
    String oid = getPathSegment(req, 1);
    boolean oidSet = !Strings.isNullOrEmpty(oid);
    String user = req.getParameter("user");
    boolean userSet = !Strings.isNullOrEmpty(user);

    // Parse range
    String rangeHeader = req.getHeader("Range");
    int[] range = { 0, DEFAULT_ORDER_LIMIT };
    if (!Strings.isNullOrEmpty(rangeHeader)) {
      String[] rangeStrings = rangeHeader.substring(6).split("-");
      if (rangeStrings.length == 2) {
        for (int i = 0; i < range.length; i++) {
          range[i] = Integer.parseInt(rangeStrings[i]);
        }
      }
    }

    // Prepare database variables
    Connection conn = null;
    PreparedStatement stmt = null;
    PreparedStatement countStmt = null;
    ResultSet results = null;
    ResultSet countResults = null;

    // Writers
    //JSONWriter writer = getJSONWriter(res);
    PrintWriter resWriter = res.getWriter();
    StringWriter body = new StringWriter();
    JSONWriter jsonWriter = new JSONWriter(body);

    // Construct and prepare query
    String query = "SELECT * FROM orders";
    String countQuery = "SELECT COUNT(*) FROM orders";
    final String LIMIT_OFFSET = " LIMIT ? OFFSET ?";
    try {
      conn = getDataSource(req).getConnection();
      if (ridSet && oidSet && userSet) {
        String addition = " WHERE id = ? AND rid = ? AND user = ?";
        countQuery += addition;
        query += addition + LIMIT_OFFSET;
        countStmt = conn.prepareStatement(countQuery);
        stmt = conn.prepareStatement(query);
        // Count Query
        countStmt.setInt(1, Integer.parseInt(oid));
        countStmt.setInt(2, Integer.parseInt(rid));
        countStmt.setString(3, user);
        // Regular Query
        stmt.setInt(1, Integer.parseInt(oid));
        stmt.setInt(2, Integer.parseInt(rid));
        stmt.setString(3, user);
        stmt.setInt(4, range[1] - range[0]);
        stmt.setInt(5, range[0]);
      } else if (ridSet && oidSet) {
        String addition = " WHERE id = ? AND rid = ?";
        countQuery += addition;
        query += addition + LIMIT_OFFSET;
        countStmt = conn.prepareStatement(countQuery);
        stmt = conn.prepareStatement(query);
        // Count Query
        countStmt.setInt(1, Integer.parseInt(oid));
        countStmt.setInt(2, Integer.parseInt(rid));
        // Regular Query
        stmt.setInt(1, Integer.parseInt(oid));
        stmt.setInt(2, Integer.parseInt(rid));
        stmt.setInt(3, range[1] - range[0]);
        stmt.setInt(4, range[0]);
      } else if (ridSet && !userSet) {
        String addition = " WHERE rid = ?";
        countQuery += addition;
        query += addition + LIMIT_OFFSET;
        countStmt = conn.prepareStatement(countQuery);
        stmt = conn.prepareStatement(query);
        // Count Query
        countStmt.setInt(1, Integer.parseInt(rid));
        // Regular Query
        stmt.setInt(1, Integer.parseInt(rid));
        stmt.setInt(2, range[1] - range[0]);
        stmt.setInt(3, range[0]);
      } else if (ridSet && userSet) {
        String addition = " WHERE rid = ? AND user = ?";
        countQuery += addition;
        query += addition + LIMIT_OFFSET;
        countStmt = conn.prepareStatement(countQuery);
        stmt = conn.prepareStatement(query);
        // Count Query
        countStmt.setInt(1, Integer.parseInt(rid));
        countStmt.setString(2, user);
        // Regular Query
        stmt.setInt(1, Integer.parseInt(rid));
        stmt.setString(2, user);
        stmt.setInt(3, range[1] - range[0]);
        stmt.setInt(4, range[0]);
      } else if (userSet) {
        String addition = " WHERE user = ?";
        countQuery += addition;
        query += addition + LIMIT_OFFSET;
        countStmt = conn.prepareStatement(countQuery);
        stmt = conn.prepareStatement(query);
        // Count Query
        countStmt.setString(1, user);
        // Regular Query
        stmt.setString(1, user);
        stmt.setInt(2, range[1] - range[0]);
        stmt.setInt(3, range[0]);
      }
      // Execute query
      countResults = countStmt.executeQuery();
      countResults.next();
      results = stmt.executeQuery();
      int count = 0;
      jsonWriter.array();
      while (results.next()) {
        count++;
        writeJSONObjectOrder(jsonWriter, results.getInt(1), results.getInt(2), results.getString(3),
                results.getString(4), results.getString(5), results.getInt(6), results.getString(7));
      }
      jsonWriter.endArray();
      
      // Write out range information
      res.setHeader("Content-Range", "items " + range[0] + "-" + (range[0] + count) + "/" + countResults.getInt(1));
      resWriter.write(body.toString());
    } catch (Exception e) {
      LOGGER.logp(Level.SEVERE, CLAZZ, "doGet", e.getMessage());
    } finally {
      close(resWriter, jsonWriter, conn);
    }
  }

  /**
   * DELETE /orders/<runid>/<orderid>
   * 
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

    // Get the run id and order id, the run id is just for verification -- the primary key is just
    // the order id
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
   * 
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
        writer.object().key("error")
                .value("Putting requires a run id, an user id, an item, and a price.");
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
    query.append("(`rid`,`user`,`item`,`size`,`price`,`comments`").append(
            !hasOrderId ? ") " : ",`id`) ");
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
        writeJSONObjectOrder(writer, Integer.valueOf(order, 10), rid, user, item, size, cents,
                comments);
      } else {
        writer.object().key("error").value("Did not insert order.").endObject();
      }
    } catch (Exception e) {
      LOGGER.logp(Level.SEVERE, CLAZZ, "doPut", e.getMessage());
    } finally {
      close(result, stmt, conn, writer);
    }
  }
  
  /**
   * Writes the values of an order to a JSON object
   * 
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
  private void writeJSONObjectOrder(JSONWriter writer, int id, int rid, String user, String item,
          String size, int price, String comments) throws IllegalStateException,
          NullPointerException, IOException, JSONException {
    writer.object().key("id").value(id).key("rid").value(rid).key("user").value(user).key("item")
            .value(item).key("size").value(size).key("price").value(price).key("comments")
            .value(comments).endObject();
  }
}

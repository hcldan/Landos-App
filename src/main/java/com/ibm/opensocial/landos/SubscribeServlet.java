package com.ibm.opensocial.landos;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.wink.json4j.JSONWriter;

public class SubscribeServlet extends BaseServlet {
  private static final long serialVersionUID = 8636321669435402465L;
  private static final String CLAZZ = SubscribeServlet.class.getName();
  private static final Logger LOGGER = Logger.getLogger(CLAZZ);

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    resp.setHeader("CACHE-CONTROL", "no-cache");
    resp.setContentType("application/json");
    
    String osid = req.getHeader("OPENSOCIAL-ID");
    JSONWriter writer = new JSONWriter(resp.getWriter());
    try {
      writer.object()
        .key("id").value(osid)
        .key("subscribed").value(isSubscribed(osid))
      .endObject();
    } catch (Exception e) {
      LOGGER.logp(Level.SEVERE, CLAZZ, "doGet", e.getMessage(), e);
      throw new ServletException(e);
    } finally {
      writer.close();
    }
  }
  
  private boolean isSubscribed(String user) throws SQLException {
    boolean ret = false;
    if (user != null) {
      Connection connection = null;
      PreparedStatement stmt = null;
      try {
        connection = dbSource.getConnection();
        stmt = connection.prepareStatement("SELECT COUNT(*) from `subscribed` WHERE `user`=?");
        ResultSet result = stmt.executeQuery();
        if (result.first()) {
          ret = result.getInt(1) > 0;
        }
      } finally {
        stmt.close();
        connection.close();
      }
    }
    return ret;
  }
}


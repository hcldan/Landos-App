package com.ibm.opensocial.landos;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.wink.json4j.JSONWriter;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;

public class ItemSearchServlet extends BaseServlet {
  private static final long serialVersionUID = -7084594235567935205L;
  private static final String CLAZZ = ItemSearchServlet.class.getName();
  private static final Logger LOGGER = Logger.getLogger(CLAZZ);
  private static final int NOT_ENOUGH_CHARS = 2;
  
  public static final String CACHE_YEAR = "public, max-age=31557600";
  public static final String CACHE_MONTH = "public, max-age=2678400";

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    String term = getPathSegment(req, 0);
    term = term == null ? "" : term.trim();
    resp.setHeader("CACHE-CONTROL", term.length() > NOT_ENOUGH_CHARS ? CACHE_MONTH : CACHE_YEAR);
    resp.setContentType("application/json");
    
    JSONWriter writer = new JSONWriter(resp.getWriter());
    
    try {
      List<Map<String, String>> matches = findMatches(req, term);
      writer.object()
        .key("matches").value(matches)
      .endObject();
    } catch (Exception e) {
      LOGGER.logp(Level.SEVERE, CLAZZ, "doGet", e.getMessage(), e);
      throw new ServletException(e);
    } finally {
      close(writer);
    }
  }
  
  private List<Map<String, String>> findMatches(HttpServletRequest req, String term) throws SQLException {
    List<Map<String, String>> ret = Lists.newLinkedList();
    
    if (term.length() > NOT_ENOUGH_CHARS) {
      List<String> tokens = Lists.newLinkedList();
      StringBuilder query = new StringBuilder("SELECT `category`, `food` FROM `foods` WHERE (");
      StringTokenizer stok = new StringTokenizer(term, " ");
      while (stok.hasMoreElements()) {
        tokens.add(stok.nextToken());
        query.append("(LOWER(`food`) LIKE CONCAT(\"%\", LOWER(?), \"%\") OR LOWER(`category`) LIKE CONCAT(\"%\", LOWER(?), \"%\"))");
        if (stok.hasMoreElements())
          query.append(" AND ");
      }
      query.append(") ORDER BY `category` ASC");
      
      ret = searchForFood(req, query.toString(), tokens);
    }
    
    return ret;
  }
  
  private List<Map<String, String>> searchForFood(HttpServletRequest req, String query, List<String> tokens) throws SQLException {
    List<Map<String, String>> ret = Lists.newLinkedList();
    
    Connection connection = null;
    PreparedStatement stmt = null;
    ResultSet result = null;
    try {
      connection = getDataSource(req).getConnection();
      stmt = connection.prepareStatement(query);
      
      int i = 1;
      for (String token : tokens) {
        stmt.setString(i++, token);
        stmt.setString(i++, token);
      }
      
      result = stmt.executeQuery();
      if (result.first()) {
        do {
          ret.add(
            ImmutableMap.<String, String>builder()
              .put("category", result.getString(1))
              .put("food", result.getString(2))
            .build()
          );
        } while (result.next());
      }
    } finally {
      close(result, stmt, connection);
    }
    
    return ret;
  }
}


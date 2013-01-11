package com.ibm.opensocial.landos;

import java.io.IOException;
import java.net.URLDecoder;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.wink.json4j.JSONWriter;

import com.google.common.base.Charsets;

public class ItemSearchServlet extends BaseServlet {
  private static final long serialVersionUID = -7084594235567935205L;
  private static final String CLAZZ = ItemSearchServlet.class.getName();
  private static final Logger LOGGER = Logger.getLogger(CLAZZ);

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    resp.setHeader("CACHE-CONTROL", "public, max-age=2678400"); // 31 days
    resp.setContentType("application/json");
    
    JSONWriter writer = new JSONWriter(resp.getWriter());
    String term = URLDecoder.decode(req.getPathInfo(), Charsets.UTF_8.name()).trim();
    if (term.startsWith("/"))
      term = term.substring(1);
    
    try {
      writer.object()
        .key("matches").value(null)
      .endObject();
    } catch (Exception e) {
      LOGGER.logp(Level.SEVERE, CLAZZ, "doGet", e.getMessage(), e);
      throw new ServletException(e);
    } finally {
      close(writer);
    }
  }
  
  public List<Map<String, String>> findMatches(String term) {
    return null;
  }
}


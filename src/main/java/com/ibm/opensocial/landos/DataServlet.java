package com.ibm.opensocial.landos;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.wink.json4j.JSONWriter;

public class DataServlet extends BaseServlet {
  private static final long serialVersionUID = 8636321669435402465L;
  private static final String CLAZZ = DataServlet.class.getName();
  private static final Logger LOGGER = Logger.getLogger(CLAZZ);

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    resp.setHeader("Cache-Control", "no-cache");
    resp.setContentType("application/json");
    
    String osid = req.getHeader("OPENSOCIAL-ID");
    JSONWriter writer = new JSONWriter(resp.getWriter());
    try {
      writer.object()
        .key("id").value(osid)
      .endObject();
    } catch (Exception e) {
      throw new ServletException(e);
    } finally {
      writer.close();
    }
  }
  
}


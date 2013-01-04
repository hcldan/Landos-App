package com.ibm.opensocial.landos;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

public class DataServlet extends HttpServlet {
  private static final long serialVersionUID = 8636321669435402465L;
  private static final String CLAZZ = DataServlet.class.getName();
  private static final Logger LOGGER = Logger.getLogger(CLAZZ);
  protected static DataSource dbConnection = null;

  @Override
  public void init(ServletConfig config) throws ServletException {
    super.init(config);
    
    if (dbConnection == null) {
      try {
        Context initCtx = new InitialContext();
        Context envCtx = (Context)initCtx.lookup("java:comp/env");
        dbConnection = (DataSource)envCtx.lookup("jdbc/landos");
      } catch (Exception e) {
        LOGGER.logp(Level.SEVERE, CLAZZ, "init", e.getMessage(), e);
      }
    }
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    resp.setHeader("CACHE-CONTROL", "no-cache");
    resp.setContentType("application/json");
    resp.getOutputStream().println("\"yay!\"");
    resp.getOutputStream().close();
  }
}


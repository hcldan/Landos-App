/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package com.ibm.opensocial.landos;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.sql.DataSource;

public class BaseServlet extends HttpServlet {
  private static final String CLAZZ = BaseServlet.class.getName();
  private static final Logger LOGGER = Logger.getLogger(CLAZZ);
  protected static DataSource dbSource = null;

  @Override
  public void init(ServletConfig config) throws ServletException {
    super.init(config);
    
    if (dbSource == null) {
      try {
        Context initCtx = new InitialContext();
        Context envCtx = (Context)initCtx.lookup("java:comp/env");
        dbSource = (DataSource)envCtx.lookup("jdbc/landos");
      } catch (Exception e) {
        LOGGER.logp(Level.SEVERE, CLAZZ, "init", e.getMessage(), e);
      }
    }
  }
}


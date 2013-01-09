package com.ibm.opensocial.landos;

import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;

import java.io.PrintWriter;
import java.io.Writer;
import java.sql.Connection;
import java.util.Collections;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import org.easymock.Capture;
import org.easymock.IAnswer;

public class TestUtils {
  public static HttpServletRequest mockRequest(Map<String, Object> attributes, final DataSource source, String url) {   
    HttpServletRequest req = createMock(HttpServletRequest.class);
    expect(req.getPathInfo()).andReturn(url).anyTimes();
    
    final Map<String, Object> attrs = Collections.synchronizedMap(attributes);
    final Capture<String> attName = new Capture<String>();
    final Capture<Object> attValue = new Capture<Object>();
    
    // Mock setting and getting of attributes.
    req.setAttribute(capture(attName), capture(attValue));
    expectLastCall().andAnswer(new IAnswer<Object>() {
      @Override
      public Object answer() throws Throwable {
        return attrs.put(attName.getValue(), attValue.getValue());
      }
    }).anyTimes();
    expect(req.getAttribute(capture(attName))).andAnswer(new IAnswer<Object>() {
      @Override
      public Object answer() throws Throwable {
        if (attName.getValue().equals(BaseServlet.DATA_SOURCE))
          return source;
        else
          return attrs.get(attName.getValue());
      }
    }).anyTimes();
    
    return req;
  }
  
  public static HttpServletResponse mockResponse(Writer output) throws Exception {   
    HttpServletResponse resp = createMock(HttpServletResponse.class);
    resp.setHeader("CACHE-CONTROL", "no-cache");
    resp.setContentType("application/json");
    
    PrintWriter pout = new PrintWriter(output);
    expect(resp.getWriter()).andReturn(pout).anyTimes();
    
    return resp;
  }
  
  public static DataSource mockDataSource(Connection connection) throws Exception {
    DataSource source = createMock(DataSource.class);
    expect(source.getConnection()).andReturn(connection).anyTimes();
    return source;
  }
  
  public static Connection mockConnection() throws Exception {
    Connection connection = createMock(Connection.class);
    connection.close(); expectLastCall().atLeastOnce(); 
    return connection;
  }
}


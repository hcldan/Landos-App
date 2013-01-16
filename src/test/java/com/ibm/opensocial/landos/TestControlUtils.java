package com.ibm.opensocial.landos;

import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;

import java.io.PrintWriter;
import java.io.Writer;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Collections;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import org.easymock.Capture;
import org.easymock.IAnswer;
import org.easymock.IMocksControl;

import com.google.common.collect.Maps;

public class TestControlUtils {
  public static HttpServletRequest mockRequest(IMocksControl control, Map<String, Object> attributes, final DataSource source, String pathInfo) {
    HttpServletRequest req = control.createMock(HttpServletRequest.class);
    expect(req.getPathInfo()).andReturn(pathInfo).anyTimes();

    if (attributes == null)
      attributes = Maps.newHashMap();
    final Map<String, Object> attrs = Collections.synchronizedMap(attributes);
    final Capture<String> attName = new Capture<String>();
    final Capture<Object> attValue = new Capture<Object>();

    // Mock setting and getting of attributes
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

  public static HttpServletResponse mockResponse(IMocksControl control, Writer output, String cacheHeader) throws Exception {
    HttpServletResponse res = control.createMock(HttpServletResponse.class);
    res.setHeader("Cache-Control", cacheHeader);
    expectLastCall().once();
    res.setContentType("application/json");
    expectLastCall().once();

    PrintWriter pout = new PrintWriter(output);
    expect(res.getWriter()).andReturn(pout).anyTimes();

    return res;
  }
  
  public static HttpServletResponse mockResponse(IMocksControl control, Writer output) throws Exception {
    return mockResponse(control, output, "no-cache");
  }

  public static DataSource mockDataSource(IMocksControl control, Connection connection)
          throws SQLException {
    DataSource source = control.createMock(DataSource.class);
    expect(source.getConnection()).andReturn(connection).anyTimes();
    return source;
  }

  public static Connection mockConnection(IMocksControl control) throws SQLException {
    Connection connection = control.createMock(Connection.class);
    return connection;
  }

}

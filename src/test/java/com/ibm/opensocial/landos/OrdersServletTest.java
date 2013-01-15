package com.ibm.opensocial.landos;

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.eq;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.io.StringWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import org.easymock.EasyMock;
import org.easymock.IAnswer;
import org.easymock.IMocksControl;
import org.junit.Before;
import org.junit.Test;

import com.google.common.collect.Maps;

public class OrdersServletTest {
  private OrdersServlet servlet;
  private Connection conn;
  private DataSource source;
  private Map<String, Object> attributes;
  private StringWriter output;
  private IMocksControl control;
  private HttpServletRequest req;
  private HttpServletResponse res;
  private final int rid = 9001;
  private final int uid = 101;
  private final String[] items = {"Pizza", "Soda"};
  private final String[] sizes = {"", "Small"};
  private final int[] qties = {1, 2};
  private final int[] prices = {500, 150};
  private final String[] comments = {"Foo", "Bar"};

  @Before
  public void before() throws Exception {
    servlet = new OrdersServlet();
    output = new StringWriter();
    control = EasyMock.createNiceControl();
    conn = TestControlUtils.mockConnection(control);
    source = TestControlUtils.mockDataSource(control, conn);
    attributes = Maps.newHashMap();
    res = TestControlUtils.mockResponse(control, output);
  }

  @Test
  public void testGetOrdersForRun() throws Exception {
    // Set up mocks and expectations
    req = TestControlUtils.mockRequest(control, attributes, source, "/" + rid);
    expect(req.getParameter("user")).andReturn(null).once();
    expect(req.getParameter("item")).andReturn(null).once();
    PreparedStatement stmt = control.createMock(PreparedStatement.class);
    expect(conn.prepareStatement(anyObject(String.class))).andReturn(stmt);
    stmt.setInt(1, rid); expectLastCall().once();
    ResultSet results = control.createMock(ResultSet.class);
    expect(stmt.executeQuery()).andReturn(results).once();
    for (int i = 0; i < 2; i++) {
      expect(results.next()).andReturn(true).once();
      expect(results.getInt(1)).andReturn(uid);
      expect(results.getString(2)).andReturn(items[i]);
      expect(results.getString(3)).andReturn(sizes[i]);
      expect(results.getInt(4)).andReturn(qties[i]);
      expect(results.getInt(5)).andReturn(prices[i]);
      expect(results.getString(6)).andReturn(comments[i]);
    }
    expect(results.next()).andReturn(false).once();
    
    // Run test
    control.replay();
    servlet.doGet(req, res);
    control.verify();
    assertEquals("[{\"uid\":101,\"item\":\"Pizza\",\"size\":\"\",\"qty\":1,\"price\":500,\"comments\":\"Foo\"},{\"uid\":101,\"item\":\"Soda\",\"size\":\"Small\",\"qty\":2,\"price\":150,\"comments\":\"Bar\"}]", output.toString());
  }
}

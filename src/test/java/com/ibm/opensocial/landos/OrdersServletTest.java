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
      expect(results.getInt(1)).andReturn(rid).once();
      expect(results.getInt(2)).andReturn(uid).once();
      expect(results.getString(3)).andReturn(items[i]).once();
      expect(results.getString(4)).andReturn(sizes[i]).once();
      expect(results.getInt(5)).andReturn(qties[i]).once();
      expect(results.getInt(6)).andReturn(prices[i]).once();
      expect(results.getString(7)).andReturn(comments[i]).once();
    }
    expect(results.next()).andReturn(false).once();
    
    // Run test
    control.replay();
    servlet.doGet(req, res);
    control.verify();
    assertEquals("[{\"rid\":9001,\"uid\":101,\"item\":\"Pizza\",\"size\":\"\",\"qty\":1,\"price\":500,\"comments\":\"Foo\"},{\"rid\":9001,\"uid\":101,\"item\":\"Soda\",\"size\":\"Small\",\"qty\":2,\"price\":150,\"comments\":\"Bar\"}]", output.toString());
  }
  
  @Test
  public void testDeleteOrder() throws Exception {
    // Set up mocks and expectations
    req = TestControlUtils.mockRequest(control, attributes, source, "/" + rid);
    expect(req.getParameter("user")).andReturn("" + uid).once();
    expect(req.getParameter("item")).andReturn(items[0]).once();
    PreparedStatement stmt = control.createMock(PreparedStatement.class);
    expect(conn.prepareStatement(anyObject(String.class))).andReturn(stmt).once();
    stmt.setInt(1, rid); expectLastCall().once();
    stmt.setInt(2, uid); expectLastCall().once();
    stmt.setString(3, items[0]); expectLastCall().once();
    expect(stmt.executeUpdate()).andReturn(1);
    
    // Run test
    control.replay();
    servlet.doDelete(req, res);
    control.verify();
    assertEquals("{\"delete\":1}", output.toString());
  }
  
  @Test
  public void testPutOrder() throws Exception {
    // Set up mocks and expectations
    req = TestControlUtils.mockRequest(control, attributes, source, "/" + rid);
    expect(req.getParameter("user")).andReturn("" + uid).once();
    expect(req.getParameter("item")).andReturn(items[0]).once();
    expect(req.getParameter("price")).andReturn("" + prices[0]).once();
    expect(req.getParameter("size")).andReturn(sizes[0]).once();
    expect(req.getParameter("comments")).andReturn(comments[0]).once();
    expect(req.getParameter("qty")).andReturn("" + qties[0]);
    PreparedStatement stmt = control.createMock(PreparedStatement.class);
    expect(conn.prepareStatement(anyObject(String.class))).andReturn(stmt).once();
    stmt.setInt(1, rid); expectLastCall().once();
    stmt.setInt(2, uid); expectLastCall().once();
    stmt.setString(3, items[0]); expectLastCall().once();
    stmt.setString(4, sizes[0]); expectLastCall().once();
    stmt.setInt(5, qties[0]); expectLastCall().once();
    stmt.setInt(6, prices[0]); expectLastCall().once();
    stmt.setString(7, comments[0]); expectLastCall().once();
    expect(stmt.executeUpdate()).andReturn(1).once();
    
    // Run test
    control.replay();
    servlet.doPut(req, res);
    control.verify();
    assertEquals("{\"rid\":9001,\"uid\":101,\"item\":\"Pizza\",\"size\":\"\",\"qty\":1,\"price\":500,\"comments\":\"Foo\"}", output.toString());
  }
}

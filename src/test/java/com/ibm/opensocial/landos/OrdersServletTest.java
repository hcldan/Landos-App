package com.ibm.opensocial.landos;

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.eq;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.junit.Assert.assertEquals;

import com.google.common.collect.Maps;

import org.apache.wink.json4j.JSONWriter;
import org.easymock.EasyMock;
import org.easymock.IMocksControl;
import org.junit.Before;
import org.junit.Test;

import java.io.StringWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

public class OrdersServletTest {
  private OrdersServlet servlet;
  private Connection conn;
  private DataSource source;
  private Map<String, Object> attributes;
  private StringWriter output;
  private IMocksControl control;
  private HttpServletRequest req;
  private HttpServletResponse res;
  private final int oid = 7357;
  private final int rid = 9001;
  private final int uid = 101;
  private final String[] items = { "Pizza", "Soda" };
  private final String[] sizes = { "", "Small" };
  private final int[] prices = { 500, 150 };
  private final String[] comments = { "Foo", "Bar" };

  @Before
  public void before() throws Exception {
    servlet = new OrdersServlet();
    output = new StringWriter();
    control = EasyMock.createControl();
    conn = TestControlUtils.mockConnection(control);
    conn.close(); expectLastCall().once();
    source = TestControlUtils.mockDataSource(control, conn);
    attributes = Maps.newHashMap();
    res = TestControlUtils.mockResponse(control, output);
  }

  @Test
  public void testGetOrdersForRun() throws Exception {
    // Set up mocks and expectations
    req = TestControlUtils.mockRequest(control, attributes, source, "/" + rid);
    expect(req.getParameter("user")).andReturn(null).once();
    expect(req.getHeader("Range")).andReturn("items=0-20").once();
    PreparedStatement stmt = control.createMock(PreparedStatement.class);
    expect(conn.prepareStatement(anyObject(String.class))).andReturn(stmt);
    stmt.setInt(1, rid);
    expectLastCall().once();
    stmt.setInt(2, rid);
    expectLastCall().once();
    stmt.setInt(3, 20);
    expectLastCall().once();
    stmt.setInt(4, 0);
    ResultSet results = control.createMock(ResultSet.class);
    expect(stmt.executeQuery()).andReturn(results).once();
    for (int i = 0; i < 2; i++) {
      expect(results.next()).andReturn(true).once();
      expect(results.getInt(1)).andReturn(i).once();
      expect(results.getInt(2)).andReturn(rid).once();
      expect(results.getString(3)).andReturn("" + uid).once();
      expect(results.getString(4)).andReturn(items[i]).once();
      expect(results.getString(5)).andReturn(sizes[i]).once();
      expect(results.getInt(6)).andReturn(prices[i]).once();
      expect(results.getString(7)).andReturn(comments[i]).once();
    }
    expect(results.next()).andReturn(false).once();
    expect(results.getInt(8)).andReturn(2).once();
    res.setHeader("Content-Range", "items 0-2/2");
    expectLastCall().once();

    // Run test
    control.replay();
    servlet.doGet(req, res);
    control.verify();
    StringWriter sw = new StringWriter();
    JSONWriter writer = new JSONWriter(sw);
    writer.array();
    for (int i = 0; i < 2; i++) {
      writer.object()
        .key("id").value(i)
        .key("rid").value(rid)
        .key("user").value(Integer.toString(uid, 10))
        .key("item").value(items[i])
        .key("size").value(sizes[i])
        .key("price").value(prices[i])
        .key("comments").value(comments[i])
      .endObject();
    }
    writer.endArray().flush();
    assertEquals("Unexpected servlet output.", sw.toString(), output.toString());
  }

  @Test
  public void testDeleteOrder() throws Exception {
    // Set up mocks and expectations
    req = TestControlUtils.mockRequest(control, attributes, source, "/" + rid + "/" + oid);
    PreparedStatement stmt = control.createMock(PreparedStatement.class);
    expect(conn.prepareStatement(anyObject(String.class))).andReturn(stmt).once();
    stmt.setInt(1, oid);
    expectLastCall().once();
    stmt.setInt(2, rid);
    expectLastCall().once();
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
    expect(req.getParameter("user")).andReturn(Integer.toString(uid, 10)).once();
    expect(req.getParameter("item")).andReturn(items[0]).once();
    expect(req.getParameter("price")).andReturn("" + prices[0]).once();
    expect(req.getParameter("size")).andReturn(sizes[0]).once();
    expect(req.getParameter("comments")).andReturn(comments[0]).once();
    PreparedStatement stmt = control.createMock(PreparedStatement.class);
    expect(conn.prepareStatement(anyObject(String.class), eq(PreparedStatement.RETURN_GENERATED_KEYS))).andReturn(stmt).once();
    stmt.setInt(1, rid); expectLastCall().once();
    stmt.setString(2, Integer.toString(uid, 10)); expectLastCall().once();
    stmt.setString(3, items[0]); expectLastCall().once();
    stmt.setString(4, sizes[0]); expectLastCall().once();
    stmt.setInt(5, prices[0]); expectLastCall().once();
    stmt.setString(6, comments[0]); expectLastCall().once();
    expect(stmt.executeUpdate()).andReturn(1).once();

    ResultSet result = control.createMock(ResultSet.class);
    expect(stmt.getGeneratedKeys()).andReturn(result).once();
    expect(result.first()).andReturn(true).once();
    expect(result.getInt(1)).andReturn(1).once();
    result.close(); expectLastCall().once();
    stmt.close(); expectLastCall().once();
    
    // Run test
    control.replay();
    servlet.doPut(req, res);
    control.verify();
    
    StringWriter sw = new StringWriter();
    JSONWriter writer = new JSONWriter(sw);
    writer.object()
      .key("id").value(1)
      .key("rid").value(rid)
      .key("user").value(Integer.toString(uid, 10))
      .key("item").value(items[0])
      .key("size").value(sizes[0])
      .key("price").value(prices[0])
      .key("comments").value(comments[0])
    .endObject().flush();
      
    assertEquals("Unexpected servlet output.", sw.toString(), output.toString());
  }
}

package com.ibm.opensocial.landos;

import java.io.StringWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import org.easymock.EasyMock;
import org.easymock.IMocksControl;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class ItemSearchServletTest extends EasyMock { 
  private ItemSearchServlet servlet;
  private IMocksControl control;
  private HttpServletRequest req;
  private StringWriter output;
  private HttpServletResponse resp;
  private Connection connection;
  private DataSource source;
  private PreparedStatement stmt;
  private ResultSet result;
  
  @Before
  public void before() throws Exception {
    servlet = new ItemSearchServlet();
    control = createControl();
    output = new StringWriter();
    
    connection = TestControlUtils.mockConnection(control);
    source = TestControlUtils.mockDataSource(control, connection);
    stmt = control.createMock(PreparedStatement.class);
    result = control.createMock(ResultSet.class);
  }
  
  @After
  public void after() {
    
  }
  
  @Test
  public void testTooShortStringOne() throws Exception {
    req = TestControlUtils.mockRequest(control, null, null, "/a");
    resp = TestControlUtils.mockResponse(control, output, ItemSearchServlet.CACHE_YEAR);
    
    control.replay();
    servlet.doGet(req, resp);
    control.verify();
    
    assertEquals("Empty output", "{\"matches\":[]}", output.toString());
  }
  
  @Test
  public void testTooShortStringTwo() throws Exception {
    req = TestControlUtils.mockRequest(control, null, null, "/aa");
    resp = TestControlUtils.mockResponse(control, output, ItemSearchServlet.CACHE_YEAR);
    
    control.replay();
    servlet.doGet(req, resp);
    control.verify();
    
    assertEquals("Empty output", "{\"matches\":[]}", output.toString());
  }
  
  @Test
  public void testStringEmptyNoResults() throws Exception {
    req = TestControlUtils.mockRequest(control, null, source, "/");
    resp = TestControlUtils.mockResponse(control, output, ItemSearchServlet.CACHE_YEAR);
    
    expect(connection.prepareStatement(
      "SELECT `category`, `food` FROM `foods` WHERE 1 ORDER BY `category` ASC"
    )).andReturn(stmt);
    expect(stmt.executeQuery()).andReturn(result).once();
    
    expect(result.first()).andReturn(false).once();
    result.close(); expectLastCall().once();
    
    stmt.close(); expectLastCall().once();
    connection.close(); expectLastCall().once();
    
    control.replay();
    servlet.doGet(req, resp);
    control.verify();
    
    assertEquals("Empty output", "{\"matches\":[]}", output.toString());
  }
  
  @Test
  public void testStringEmptyOneResult() throws Exception {
    req = TestControlUtils.mockRequest(control, null, source, "/");
    resp = TestControlUtils.mockResponse(control, output, ItemSearchServlet.CACHE_YEAR);
    
    expect(connection.prepareStatement(
      "SELECT `category`, `food` FROM `foods` WHERE 1 ORDER BY `category` ASC"
    )).andReturn(stmt);
    expect(stmt.executeQuery()).andReturn(result).once();
    
    expect(result.first()).andReturn(true).once();
    expect(result.getString(1)).andReturn("foo").once();
    expect(result.getString(2)).andReturn("bar").once();
    expect(result.next()).andReturn(false).once();
    result.close(); expectLastCall().once();
    
    stmt.close(); expectLastCall().once();
    connection.close(); expectLastCall().once();
    
    control.replay();
    servlet.doGet(req, resp);
    control.verify();
    
    assertEquals("Empty output", "{\"matches\":[{\"category\":\"foo\",\"food\":\"bar\"}]}", output.toString());
  }
  
  @Test
  public void testOneTermNoMatches() throws Exception {
    req = TestControlUtils.mockRequest(control, null, source, "/aaa");
    resp = TestControlUtils.mockResponse(control, output, ItemSearchServlet.CACHE_MONTH);
    
    expect(connection.prepareStatement(
      "SELECT `category`, `food` FROM `foods` WHERE (" +
        "(LOWER(`food`) LIKE CONCAT(\"%\", LOWER(?), \"%\") OR LOWER(`category`) LIKE CONCAT(\"%\", LOWER(?), \"%\"))" +
      ") ORDER BY `category` ASC"
    )).andReturn(stmt);
    
    stmt.setString(1, "aaa"); expectLastCall().once();
    stmt.setString(2, "aaa"); expectLastCall().once();
    expect(stmt.executeQuery()).andReturn(result).once();
    
    expect(result.first()).andReturn(false).once();
    result.close(); expectLastCall().once();
    
    stmt.close(); expectLastCall().once();
    connection.close(); expectLastCall().once();
    
    control.replay();
    servlet.doGet(req, resp);
    control.verify();
    
    assertEquals("Empty output", "{\"matches\":[]}", output.toString());
  }
  
  @Test
  public void testOneTermOneMatch() throws Exception {
    req = TestControlUtils.mockRequest(control, null, source, "/aaa");
    resp = TestControlUtils.mockResponse(control, output, ItemSearchServlet.CACHE_MONTH);
    
    expect(connection.prepareStatement(
      "SELECT `category`, `food` FROM `foods` WHERE (" +
        "(LOWER(`food`) LIKE CONCAT(\"%\", LOWER(?), \"%\") OR LOWER(`category`) LIKE CONCAT(\"%\", LOWER(?), \"%\"))" +
      ") ORDER BY `category` ASC"
    )).andReturn(stmt);
    
    stmt.setString(1, "aaa"); expectLastCall().once();
    stmt.setString(2, "aaa"); expectLastCall().once();
    expect(stmt.executeQuery()).andReturn(result).once();
    
    expect(result.first()).andReturn(true).once();
    expect(result.getString(1)).andReturn("caaat").once();
    expect(result.getString(2)).andReturn("fud").once();
    expect(result.next()).andReturn(false).once();
    
    result.close(); expectLastCall().once();
    stmt.close(); expectLastCall().once();
    connection.close(); expectLastCall().once();
    
    control.replay();
    servlet.doGet(req, resp);
    control.verify();
    
    assertEquals("One entry found", "{\"matches\":[{\"category\":\"caaat\",\"food\":\"fud\"}]}", output.toString());
  }
  
  @Test
  public void testOneTermTwoMatches() throws Exception {
    req = TestControlUtils.mockRequest(control, null, source, "/aaa");
    resp = TestControlUtils.mockResponse(control, output, ItemSearchServlet.CACHE_MONTH);
    
    expect(connection.prepareStatement(
      "SELECT `category`, `food` FROM `foods` WHERE (" +
        "(LOWER(`food`) LIKE CONCAT(\"%\", LOWER(?), \"%\") OR LOWER(`category`) LIKE CONCAT(\"%\", LOWER(?), \"%\"))" +
      ") ORDER BY `category` ASC"
    )).andReturn(stmt);
    
    stmt.setString(1, "aaa"); expectLastCall().once();
    stmt.setString(2, "aaa"); expectLastCall().once();
    expect(stmt.executeQuery()).andReturn(result).once();
    
    expect(result.first()).andReturn(true).once();
    expect(result.getString(1)).andReturn("caaat").once();
    expect(result.getString(2)).andReturn("fud").once();
    expect(result.next()).andReturn(true).once();
    expect(result.getString(1)).andReturn("cut").once();
    expect(result.getString(2)).andReturn("faaad").once();
    expect(result.next()).andReturn(false).once();
    
    
    result.close(); expectLastCall().once();
    stmt.close(); expectLastCall().once();
    connection.close(); expectLastCall().once();
    
    control.replay();
    servlet.doGet(req, resp);
    control.verify();
    
    assertEquals("Failed two matches output.", "{\"matches\":[{\"category\":\"caaat\",\"food\":\"fud\"},{\"category\":\"cut\",\"food\":\"faaad\"}]}", output.toString());
  }
  
  @Test
  public void testTwoTermsNoMatches() throws Exception {
    req = TestControlUtils.mockRequest(control, null, source, "/aa bb");
    resp = TestControlUtils.mockResponse(control, output, ItemSearchServlet.CACHE_MONTH);
    
    expect(connection.prepareStatement(
      "SELECT `category`, `food` FROM `foods` WHERE (" +
          "(LOWER(`food`) LIKE CONCAT(\"%\", LOWER(?), \"%\") OR LOWER(`category`) LIKE CONCAT(\"%\", LOWER(?), \"%\"))" +
          " AND (LOWER(`food`) LIKE CONCAT(\"%\", LOWER(?), \"%\") OR LOWER(`category`) LIKE CONCAT(\"%\", LOWER(?), \"%\"))" +
      ") ORDER BY `category` ASC"
    )).andReturn(stmt);
    
    stmt.setString(1, "aa"); expectLastCall().once();
    stmt.setString(2, "aa"); expectLastCall().once();
    stmt.setString(3, "bb"); expectLastCall().once();
    stmt.setString(4, "bb"); expectLastCall().once();
    expect(stmt.executeQuery()).andReturn(result).once();
    
    expect(result.first()).andReturn(false).once();
    result.close(); expectLastCall().once();
    
    stmt.close(); expectLastCall().once();
    connection.close(); expectLastCall().once();
    
    control.replay();
    servlet.doGet(req, resp);
    control.verify();
    
    assertEquals("Empty output", "{\"matches\":[]}", output.toString());
  }
}


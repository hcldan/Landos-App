package com.ibm.opensocial.landos;

import static org.junit.Assert.assertEquals;

import java.io.StringWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import org.easymock.Capture;
import org.easymock.EasyMock;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.common.collect.Maps;

public class SubscribeServletTest extends EasyMock {
  private static final String TEST_USER = "com.ibm.opensocial.users:test";
  
  private SubscribeServlet servlet;
  private Connection connection;
  private DataSource source;
  private Map<String, Object> attributes;
  private HttpServletRequest req;
  private StringWriter output;
  private HttpServletResponse resp;
  
  @Before
  public void before() throws Exception {
    servlet = new SubscribeServlet();
    attributes = Maps.newHashMap();
    output = new StringWriter();
    
    connection = TestUtils.mockConnection();
    source = TestUtils.mockDataSource(connection);
    req = TestUtils.mockRequest(attributes, source, "/" + TEST_USER);
    
    resp = TestUtils.mockResponse(output);
  }
  
  @After
  public void after() {
    
  }
  
  @Test
  public void testDoGetUserSubscribedNoPath() throws Exception {
    req = TestUtils.mockRequest(attributes, source, "");
    
    PreparedStatement stmt = createMock(PreparedStatement.class);
    Capture<String> query = new Capture<String>(); 
    ResultSet result = createMock(ResultSet.class);
    
    expectIsSubscribed(stmt, query, result, "", false);

    replay(req, resp, source, connection, stmt, result);
    servlet.doGet(req, resp);
    
    assertEquals("Verify servlet output", "{\"id\":\"\",\"subscribed\":false}", output.toString());
  }
  
  @Test
  public void testDoGetUserSubscribedRootPath() throws Exception {
    req = TestUtils.mockRequest(attributes, source, "/");
    
    PreparedStatement stmt = createMock(PreparedStatement.class);
    Capture<String> query = new Capture<String>(); 
    ResultSet result = createMock(ResultSet.class);
    
    expectIsSubscribed(stmt, query, result, "", false);

    replay(req, resp, source, connection, stmt, result);
    servlet.doGet(req, resp);
    
    assertEquals("Verify servlet output", "{\"id\":\"\",\"subscribed\":false}", output.toString());
  }
  
  @Test
  public void testDoGetUserSubscribed() throws Exception {
    PreparedStatement stmt = createMock(PreparedStatement.class);
    Capture<String> query = new Capture<String>(); 
    ResultSet result = createMock(ResultSet.class);
    
    expectIsSubscribed(stmt, query, result, TEST_USER, true);

    replay(req, resp, source, connection, stmt, result);
    servlet.doGet(req, resp);
    
    assertEquals("Verify servlet output", "{\"id\":\"" + TEST_USER + "\",\"subscribed\":true}", output.toString());
  }
  
  @Test
  public void testDoGetUserUnsubscribed() throws Exception {
    PreparedStatement stmt = createMock(PreparedStatement.class);
    Capture<String> query = new Capture<String>(); 
    ResultSet result = createMock(ResultSet.class);
    
    expectIsSubscribed(stmt, query, result, TEST_USER, false);

    replay(req, resp, source, connection, stmt, result);
    servlet.doGet(req, resp);
    
    assertEquals("Verify servlet output", "{\"id\":\"" + TEST_USER + "\",\"subscribed\":false}", output.toString());
  }
  
  @Test
  public void testDoNoPathSubscribe() throws Exception {
    req = TestUtils.mockRequest(attributes, source, "");
    
    PreparedStatement check = createMock(PreparedStatement.class);
    Capture<String> query = new Capture<String>(); 
    ResultSet result = createMock(ResultSet.class);
    
    expectIsSubscribed(check, query, result, "", false); // checks if subscribed first.

    // Could not subscribe user.
    resp.setStatus(500); expectLastCall().once();
    replay(req, resp, source, connection, check, result);
    servlet.doPut(req, resp);
    
    assertEquals("Verify servlet output", "{\"id\":\"\",\"subscribed\":false}", output.toString());
  }
  
  @Test
  public void testDoSubscribedUserSubscribe() throws Exception {
    PreparedStatement check = createMock(PreparedStatement.class);
    Capture<String> query = new Capture<String>(); 
    ResultSet result = createMock(ResultSet.class);
    
    expectIsSubscribed(check, query, result, TEST_USER, true); // checks if subscribed first.

    // All set, the user was already subscribed.
    resp.setStatus(200); expectLastCall().once();
    replay(req, resp, source, connection, check, result);
    servlet.doPut(req, resp);
    
    assertEquals("Verify servlet output", "{\"id\":\"" + TEST_USER + "\",\"subscribed\":true}", output.toString());
  }
  
  @Test
  public void testDoUnsubscribedUserSubscribe() throws Exception {
    PreparedStatement check = createMock(PreparedStatement.class);
    Capture<String> query = new Capture<String>(); 
    ResultSet result = createMock(ResultSet.class);
    
    expectIsSubscribed(check, query, result, TEST_USER, false); // checks if subscribed first.
    
    // Insert the user, because it wasn't subscribed.
    PreparedStatement insert = createMock(PreparedStatement.class);
    expect(connection.prepareStatement(capture(query))).andReturn(insert).once();
    insert.setString(1, TEST_USER); expectLastCall().once();
    insert.close(); expectLastCall().once();
    expect(insert.executeUpdate()).andReturn(1).once();
    
    // Verify user subscription
    PreparedStatement checkAgain = createMock(PreparedStatement.class);
    ResultSet resultAgain = createMock(ResultSet.class);
    expectIsSubscribed(checkAgain, query, resultAgain, TEST_USER, true);

    resp.setStatus(200); expectLastCall().once();
    replay(req, resp, source, connection, check, result, insert, checkAgain, resultAgain);
    servlet.doPut(req, resp);
    
    assertEquals("Verify servlet output", "{\"id\":\"" + TEST_USER + "\",\"subscribed\":true}", output.toString());
  }
  
  @Test
  public void testDoNoPathUnsubscribe() throws Exception {
    req = TestUtils.mockRequest(attributes, source, "");
    
    PreparedStatement check = createMock(PreparedStatement.class);
    Capture<String> query = new Capture<String>(); 
    ResultSet result = createMock(ResultSet.class);
    
    expectIsSubscribed(check, query, result, "", false); // checks if subscribed first.

    // Didn't have to unsubscribe user.
    resp.setStatus(200); expectLastCall().once();
    replay(req, resp, source, connection, check, result);
    servlet.doDelete(req, resp);
    
    assertEquals("Verify servlet output", "{\"id\":\"\",\"subscribed\":false}", output.toString());
  }
  
  @Test
  public void testDoUnsubscribedUserUnsubscribe() throws Exception {
    PreparedStatement check = createMock(PreparedStatement.class);
    Capture<String> query = new Capture<String>(); 
    ResultSet result = createMock(ResultSet.class);
    
    expectIsSubscribed(check, query, result, TEST_USER, false); // checks if subscribed first.

    // All set, the user wasn't subscribed.
    resp.setStatus(200); expectLastCall().once();
    replay(req, resp, source, connection, check, result);
    servlet.doDelete(req, resp);
    
    assertEquals("Verify servlet output", "{\"id\":\"" + TEST_USER + "\",\"subscribed\":false}", output.toString());
  }
  
  @Test
  public void testDoSubscribedUserUnsubscribe() throws Exception {
    PreparedStatement check = createMock(PreparedStatement.class);
    Capture<String> query = new Capture<String>(); 
    ResultSet result = createMock(ResultSet.class);
    
    expectIsSubscribed(check, query, result, TEST_USER, true); // checks if subscribed first.
    
    // Delete the user, because it was subscribed.
    PreparedStatement insert = createMock(PreparedStatement.class);
    expect(connection.prepareStatement(capture(query))).andReturn(insert).once();
    insert.setString(1, TEST_USER); expectLastCall().once();
    insert.close(); expectLastCall().once();
    expect(insert.executeUpdate()).andReturn(1).once();
    
    // Verify user subscription
    PreparedStatement checkAgain = createMock(PreparedStatement.class);
    ResultSet resultAgain = createMock(ResultSet.class);
    expectIsSubscribed(checkAgain, query, resultAgain, TEST_USER, false);

    resp.setStatus(200); expectLastCall().once();
    replay(req, resp, source, connection, check, result, insert, checkAgain, resultAgain);
    servlet.doDelete(req, resp);
    
    assertEquals("Verify servlet output", "{\"id\":\"" + TEST_USER + "\",\"subscribed\":false}", output.toString());
  }
  
  private void expectIsSubscribed(PreparedStatement stmt, Capture<String> query, ResultSet result, String user, boolean isUserSubscribed) throws Exception {
    expect(connection.prepareStatement(capture(query))).andReturn(stmt).once();
    stmt.setString(1, user); expectLastCall().once();
    stmt.close(); expectLastCall().once();
    
    expect(stmt.executeQuery()).andReturn(result).once();
    result.close(); expectLastCall().once();
    
    expect(result.first()).andReturn(true).once();
    expect(result.getInt(1)).andReturn(isUserSubscribed ? 1 : 0).once();
  }
}


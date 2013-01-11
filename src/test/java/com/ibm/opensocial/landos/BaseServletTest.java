package com.ibm.opensocial.landos;

import static org.junit.Assert.assertEquals;

import javax.servlet.http.HttpServletRequest;

import org.easymock.EasyMock;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class BaseServletTest extends EasyMock { 
  private BaseServlet servlet;
  private HttpServletRequest req;
  
  @Before
  public void before() throws Exception {
    servlet = new BaseServlet();
  }
  
  @After
  public void after() {
    
  }
  
  @Test
  public void testGetLastSegmentPath() throws Exception {
    req = TestUtils.mockRequest(null, null, "/foo/bar");
    
    replay(req);
    assertEquals("Last path segment", "bar", servlet.getPathSegment(req, 1));
    verify(req);
  }
  
  @Test
  public void testFirstSegmentPathTrailingSlash() throws Exception {
    req = TestUtils.mockRequest(null, null, "/foo/bar/");
    
    replay(req);
    assertEquals("First path", "foo", servlet.getPathSegment(req, 0));
    verify(req);
  }
  
  @Test
  public void testFirstLastSegmentPath() throws Exception {
    req = TestUtils.mockRequest(null, null, "/foo");
    
    replay(req);
    assertEquals("First path", "foo", servlet.getPathSegment(req, 0));
    verify(req);
  }
}


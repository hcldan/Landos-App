package com.ibm.opensocial.landos;

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.eq;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.junit.Assert.assertEquals;

import java.io.StringWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import org.easymock.EasyMock;
import org.easymock.IMocksControl;
import org.junit.Before;
import org.junit.Test;

import com.google.common.collect.Maps;

public class RunServletTest {
	private RunServlet servlet;
	private Connection connection;
	private DataSource source;
	private Map<String, Object> attributes;
	private StringWriter output;
	private IMocksControl control;
	private HttpServletResponse res;

	@Before
	public void before() throws Exception {
		servlet = new RunServlet();
		output = new StringWriter();
		control = EasyMock.createControl();
		connection = TestControlUtils.mockConnection(control);
		source = TestControlUtils.mockDataSource(control, connection);
		attributes = Maps.newHashMap();
		res = TestControlUtils.mockResponse(control, output);
	}

	@Test
	public void testPutNewRun() throws Exception {
		final long startTime = 1000000000;
		final long endTime = startTime + 1;
		// Mocks
		String uri = "/" + startTime + "/" + endTime;
		HttpServletRequest req = TestControlUtils.mockRequest(control,
				attributes, source, uri);
		Timestamp start = new Timestamp(startTime);
		Timestamp end = new Timestamp(endTime);
		PreparedStatement stmt1 = control.createMock(PreparedStatement.class);
		PreparedStatement stmt2 = control.createMock(PreparedStatement.class);
		ResultSet result = control.createMock(ResultSet.class);
		ResultSet ids = control.createMock(ResultSet.class);
		final int expectedId = 9001;

		// Set up expectations
		expect(connection.prepareStatement(anyObject(String.class))).andReturn(stmt1)
				.anyTimes();

		expect(
				connection.prepareStatement(anyObject(String.class),
						eq(Statement.RETURN_GENERATED_KEYS))).andReturn(stmt2)
				.once();
		stmt1.setTimestamp(1, start);
		expectLastCall().once();
		stmt1.setTimestamp(2, end);
		expectLastCall().once();
		stmt2.setTimestamp(1, start);
		expectLastCall().once();
		stmt2.setTimestamp(2, end);
		expectLastCall().once();
		stmt2.setBoolean(3, false);
		expectLastCall().once();
		expect(stmt1.executeQuery()).andReturn(result).once();
		expect(result.first()).andReturn(false).once();
		expect(stmt2.executeUpdate()).andReturn(1).once();
		expect(stmt2.getGeneratedKeys()).andReturn(ids).once();
		expect(ids.first()).andReturn(true).once();
		expect(ids.getInt(1)).andReturn(expectedId).once();

		// Run test
		control.replay();
		servlet.doPut(req, res);
		control.verify();
		assertEquals("Verify servlet output", "{\"id\":" + expectedId
				+ ",\"start\":" + startTime + ",\"end\":" + endTime
				+ ",\"test\":false}", output.toString());
	}
}

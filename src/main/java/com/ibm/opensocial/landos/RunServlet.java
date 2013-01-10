package com.ibm.opensocial.landos;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.wink.json4j.JSONWriter;

public class RunServlet extends BaseServlet {
	private static final String CLAZZ = RunServlet.class.getName();
	private static final Logger LOGGER = Logger.getLogger(CLAZZ);

	/**
	 * Gets information about a particular run given an ID.
	 * 
	 * @throws IOException
	 */
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse res)
			throws IOException {
		setCacheAndTypeHeaders(res);
		int id = getId(req);

		// Create JSON writer
		JSONWriter writer = getJSONObject(res);
		
		// Prepare database variables
		Connection connection = null;
		PreparedStatement pstat = null;
		ResultSet result = null;	
		
		try {
			// Get connection
			connection = getDataSource(req).getConnection();
			// Check for overlaps
			pstat = connection.prepareStatement("SELECT * FROM runs WHERE id = ?");
			pstat.setInt(1, id);
			result = pstat.executeQuery();
			if (result.first()) {
				writer.key("id").value(id)
					.key("start").value(result.getTimestamp(2).getTime())
					.key("end").value(result.getTimestamp(3).getTime())
					.key("test").value(result.getBoolean(4))
					.endObject();
				return;
			} else {
				writer.key("error").value("Could not get run " + id).endObject();
			}
		} catch (Exception e) {
			LOGGER.logp(Level.SEVERE, CLAZZ, "doGet", e.getMessage());
		} finally {
			close(connection, writer);
		}
	}

	/**
	 * Creates a new run given a start date, an end date, and (optionally)
	 * whether the run is a test.
	 * 
	 * @throws IOException
	 */
	@Override
	protected void doPut(HttpServletRequest req, HttpServletResponse res)
			throws IOException {
		setCacheAndTypeHeaders(res);

		// Parse arguments
		final Pattern p = Pattern
				.compile("\\/(\\d+)\\/(\\d+)\\/?(?:([01])\\/?)?$");
		Matcher m = p.matcher(req.getRequestURI());
		m.find();
		Timestamp start = new Timestamp(Long.parseLong(m.group(1)));
		Timestamp end = new Timestamp(Long.parseLong(m.group(2)));
		boolean test = m.group(3) != null && m.group(3).equals("1");

		// Create JSON Writer
		JSONWriter writer = getJSONObject(res);
		
		// Check start and end times
		if (end.before(start)) {
			res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			try {
				writer.key("error").value("Start time must be before end time.").endObject();
			} catch (Exception e) {
				LOGGER.logp(Level.SEVERE, CLAZZ, "doPut", e.getMessage());
			} finally {
				writer.close();
			}
			return;
		}
		
		// Prepare database variables
		Connection connection = null;
		PreparedStatement pstat = null;
		ResultSet result = null;	
		
		try {
			// Get connection
			connection = getDataSource(req).getConnection();
			// Check for overlaps
			pstat = connection.prepareStatement("SELECT COUNT(*) FROM runs WHERE ? <= end AND ? >= start");
			pstat.setTimestamp(1, start);
			pstat.setTimestamp(2, end);
			result = pstat.executeQuery();
			if (result.first() && result.getInt(1) > 0) {
				writer.key("error")
					.value("There is already a run within the specified time range.")
					.endObject();
				return;
			}
			// Insert into database
			pstat = connection.prepareStatement("INSERT INTO runs VALUES (NULL, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS);
			pstat.setTimestamp(1, start);
			pstat.setTimestamp(2, end);
			pstat.setBoolean(3, test);
			pstat.executeUpdate();
			int insertedId = 0;
			ResultSet ids = pstat.getGeneratedKeys();
			if (ids.first()) {
				insertedId = ids.getInt(1);
			}
			// Write back to client
			writer.key("id").value(insertedId)
				.key("start").value(start.getTime())
				.key("end").value(end.getTime())
				.key("test").value(test).endObject();
		} catch (Exception e) {
			LOGGER.logp(Level.SEVERE, CLAZZ, "doPut", e.getMessage());
		} finally {
			close(connection, writer);
		}
	}

	/**
	 * Deletes a particular run given an ID.
	 * @throws IOException 
	 */
	@Override
	protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
		setCacheAndTypeHeaders(res);
		int id = getId(req);
		JSONWriter writer = getJSONObject(res);
		
		// Prepare database variables
		Connection connection = null;
		PreparedStatement pstat = null;
		int result = 0;
		
		try {
			// Get connection
			connection = getDataSource(req).getConnection();
			// Check for overlaps
			pstat = connection.prepareStatement("DELETE FROM runs WHERE id = ?");
			pstat.setInt(1, id);
			result = pstat.executeUpdate();
			// Write result
			if (result > 0) {
				writer.key("id").value(id).endObject();
			} else {
				writer.key("error").value("Could not delete " + id);
			}
		} catch (Exception e) {
			LOGGER.logp(Level.SEVERE, CLAZZ, "doDelete", e.getMessage());
		} finally {
			close(connection, writer);
		}
	}

	/**
	 * @param res
	 * @return
	 * @throws IOException
	 */
	private JSONWriter getJSONObject(HttpServletResponse res)
			throws IOException {
		return new JSONWriter(res.getWriter()).object();
	}
	
	/**
	 * Sets headers to have no cache and a type of application/json
	 * @param res The response object to set the headers on
	 */
	private void setCacheAndTypeHeaders(HttpServletResponse res) {
		res.setHeader("CACHE-CONTROL", "no-cache");
		res.setContentType("application/json");
	}
	
	/**
	 * Gets the id from a request.
	 * 
	 * @param req The request to get the id from.
	 * @return The id from the request
	 */
	private int getId(HttpServletRequest req) {
		final Pattern p = Pattern.compile("\\/(\\d+)\\/?$");
		Matcher m = p.matcher(req.getRequestURI());
		m.find();
		return Integer.parseInt(m.group(1));
	}
}
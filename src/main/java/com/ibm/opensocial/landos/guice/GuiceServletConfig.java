package com.ibm.opensocial.landos.guice;

import javax.servlet.ServletContextEvent;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.servlet.GuiceServletContextListener;
import com.google.inject.servlet.ServletModule;


public class GuiceServletConfig extends GuiceServletContextListener {
	public static final String INJECTOR_ATTRIBUTE = "com.ibm.opensocial.landos.guice.injector";
	protected Injector getInjector() {
		return Guice.createInjector(new ServletModule(), new LandosModule());
	}
	
	@Override
	public void contextInitialized(ServletContextEvent event) {
		event.getServletContext().setAttribute(INJECTOR_ATTRIBUTE, getInjector());
	}
}
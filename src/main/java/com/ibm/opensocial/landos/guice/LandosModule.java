package com.ibm.opensocial.landos.guice;

import com.google.inject.servlet.ServletModule;
import com.ibm.opensocial.landos.DataServlet;

public class LandosModule extends ServletModule {
  @Override
  protected void configureServlets() {    
//    bind(.class).to(.class);
    serve("*").with(DataServlet.class);
  }
}
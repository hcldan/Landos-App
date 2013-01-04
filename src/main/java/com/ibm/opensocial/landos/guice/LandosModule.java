package com.ibm.opensocial.landos.guice;

import com.google.inject.servlet.ServletModule;

public class LandosModule extends ServletModule {
  @Override
  protected void configureServlets() {    
//    bind(.class).to(.class);
//    serve("/servlet", "/servlet/*").with(.class);
  }
}
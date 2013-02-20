package com.ibm.opensocial.landos.email;

import java.sql.Timestamp;
import java.util.Scanner;

import javax.el.ExpressionFactory;

import de.odysseus.el.util.SimpleContext;

public class EmailRenderer {
  
  private final ExpressionFactory factory;
  private final SimpleContext context;
  
  public EmailRenderer(long id, Timestamp start, Timestamp end) {
    factory = ExpressionFactory.newInstance();
    context = new SimpleContext();
    
    context.setVariable("id", factory.createValueExpression(id, long.class));
    context.setVariable("start", factory.createValueExpression(start, Timestamp.class));
    context.setVariable("end", factory.createValueExpression(end, Timestamp.class));
  }
  
  public String renderHtmlEmail() {
    String template = new Scanner(EmailRenderer.class.getResourceAsStream("email.html"), "UTF-8")
        .useDelimiter("\\z").next();
    
    return (String) factory.createValueExpression(context, template, String.class).getValue(context);
  }
  
}


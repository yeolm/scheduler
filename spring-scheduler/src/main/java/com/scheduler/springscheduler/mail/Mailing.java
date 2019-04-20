package com.scheduler.springscheduler.mail;

import java.util.Properties;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;

import org.springframework.stereotype.Component;

@Component
public class Mailing {
	private Session session;
	
	  public Mailing() {
		  Properties  prop=new Properties();
		  prop.put("mail.smtp.auth", true);
		  prop.put("mail.smtp.starttls.enable", "true");
		  prop.put("mail.smtp.host", "smtp.gmail.com");
		  prop.put("mail.smtp.port", "587");
		  prop.put("mail.smtp.ssl.trust", "smtp.gmail.com");
		  
		 session = Session.getInstance(prop, new Authenticator() {
			    @Override
			    protected PasswordAuthentication getPasswordAuthentication() {
			        return new PasswordAuthentication("schedulermetu@gmail.com", "hilorik0634");
			    }
			});
		  
		  
	 }
	  public Session getSession() {
		  return session;
	  }
	  public void setSession(Session session) {
		  this.session=session;
	  }
	  public Session getAuthentication() {
		  return session;
	  }
	 
	 
	 
}

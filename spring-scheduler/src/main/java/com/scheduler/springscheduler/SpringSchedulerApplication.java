package com.scheduler.springscheduler;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.scheduler.springscheduler.cache.Cache;
import com.scheduler.springscheduler.mail.Mailing;
import com.scheduler.springscheduler.model.User;
import com.scheduler.springscheduler.repository.UserRepository;


@SpringBootApplication
@RestController 

public class SpringSchedulerApplication {
	     
	@Autowired 
	private UserRepository repository;
	@Autowired
	private Cache session;
	@Autowired
	private Mailing authentication;
            
  
         /*hh*/
	public static void main(String[] args) {
		
		SpringApplication.run(SpringSchedulerApplication.class, args);
	}
	//welcome
	@RequestMapping("/templates")
	public String turn() {         
		
		return "index.html";
		   
	}

	// save user
	@PostMapping("/saveUser")  
	public User saveUser(@RequestBody User user,HttpSession userSession) {
		
		if(repository.findByemail(user.getEmail())!=null) {
			return null;  
		}
		// add password hashing

		repository.save(user);
		session.addSession(userSession.getId(),user.getEmail());
		user.setPassword("");
		user.setId("");
		return user;        
	} 
	
	@PostMapping("/updateUser")
	public void updateUser(@RequestBody User user) {
		User oldUser=repository.findByemail(user.getEmail());
		oldUser.setSchedules(user.getSchedules());
		repository.save(oldUser);
		   
		
	}    
	  
	  
	// for continuous login
	@GetMapping("/known")
	public User known(HttpSession userSession) {
		if(session.haveSession(userSession.getId())) {
			User user=repository.findByemail(session.getUserEmail(userSession.getId()));
			user.setPassword("");
			user.setId("");
			return user;
		}
		return null; 
	}
	@GetMapping("/logOut")
	public void logOut(HttpSession userSession) {
		session.deleteSession(userSession.getId());
	}
	@PostMapping("/sendEmail")
	public Object sendEmail(@RequestBody String msg,HttpSession userSession) {
		
		Map<String,String> response=new HashMap<>();
		if(session.haveSession(userSession.getId())) 
		{
			String emailTo=session.getUserEmail(userSession.getId());
			Message message=new MimeMessage(authentication.getAuthentication());
			try {
						message.setRecipients(
						Message.RecipientType.TO, InternetAddress.parse(emailTo));
						message.setSubject("Time-Plan"); 
						MimeBodyPart mimeBodyPart = new MimeBodyPart();
						mimeBodyPart.setContent(msg, "text/html");
						 
						Multipart multipart = new MimeMultipart();
						multipart.addBodyPart(mimeBodyPart);
						message.setContent(multipart);

						Transport.send(message);
						response.put("state", "1");
			}
			catch(MessagingException ex) 
			{
				response.put("state", "not");
			}

		}

		return response;
		
	}
	
	@GetMapping("/findAll")  
	public List<User> findAllCustomers() {   
		return  repository.findAll(); 
	} 
	
	//login
	@GetMapping("/findByEmail/{email}/{password}")
	public User findByEmail(@PathVariable String email,@PathVariable String password,HttpSession userSession) {
		User user=repository.findByemail(email);
		System.out.println(email);
		System.out.println(password);
		if (user==null) {
			return null;
		}

		if(!user.getPassword().equals(password)) {

			return null;
		}
		
		session.addSession(userSession.getId(), email);
		
		return user;  

	}
	

}
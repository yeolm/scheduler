package com.scheduler.springscheduler;

import java.util.List;

import javax.servlet.http.HttpSession;
  
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
    
import com.scheduler.springscheduler.cache.Cache;
import com.scheduler.springscheduler.model.User;
import com.scheduler.springscheduler.repository.UserRepository;


@SpringBootApplication
@RestController

public class SpringSchedulerApplication {
	     
	@Autowired 
	private UserRepository repository;
	@Autowired
	private Cache session;
            
  
         
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
	/*
	@GetMapping("/findAll")  
	public List<User> findAllCustomers() {   
		return  repository.findAll(); 
	} */
	
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
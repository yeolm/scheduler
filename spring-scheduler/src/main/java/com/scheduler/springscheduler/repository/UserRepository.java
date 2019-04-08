package com.scheduler.springscheduler.repository;

import java.util.List;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import com.scheduler.springscheduler.model.User;

public interface UserRepository extends ElasticsearchRepository<User,String>{

	List<User> findAll();
	User findByemail(String email);
}

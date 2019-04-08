package com.scheduler.springscheduler.model;

import java.io.Serializable;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;

@Document(indexName="schedulerindex",type="user",shards=4)
public class User implements Serializable{
	
	private static final long serialVersionUID = 1L;
	@Id
	private String id;
	private String email;
	private String password;
	private String surname;
	private String department;
	private List<String> schedules;
	
	public User() {
		
	}
	public User(String email,String password,String surName,String department,List<String> schedules) {
		this.email=email;
		this.password=password;
		this.surname=surName;
		this.department=department;
		this.schedules=schedules;
		
	}
	public String getId() {
		return id;
	}
	public String getEmail() {
		return email;
	}
	public String getSurname() {
		return surname;
	}
	public String getDepartment() {
		return department;
	}
	public String getPassword() {
		return password;
	}
	public List<String> getSchedules() {
		return schedules;
	}
	public void setId(String id) {
		this.id=id;
	}
	public void setEmail(String email) {
		this.email=email;
	}
	public void setPassword(String password) {
		this.password=password;
	}
	public void setDepartment(String department) {
		this.department=department;
	}
	public void setSchedules(List<String> schedules) {
		this.schedules=schedules;
	}
	public void setSurname(String surname) {
		this.surname=surname;
	}
	public String toString() {
		return email;
		
	}
}

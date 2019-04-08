package com.scheduler.springscheduler.cache;

import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class Cache {
		@Autowired
		private final StringRedisTemplate template;
		
		
		public Cache(StringRedisTemplate template) {
			
			this.template=template;
			
		}
		public void addSession(String key,String email) {
			ListOperations<String,String>operations=template.opsForList();
			operations.leftPush(key, email);
			template.expire(key, 3, TimeUnit.MINUTES);

		}
		public String getUserEmail(String key) {
			ListOperations<String,String>operations=template.opsForList();
			return operations.index(key, 0);
			
		}
		public void deleteSession(String key) {
			template.delete(key);
		}
		public boolean haveSession(String key) {
				if(template.hasKey(key))
					return true;
				return false;
		}

		
}

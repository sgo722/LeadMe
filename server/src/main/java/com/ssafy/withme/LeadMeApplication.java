package com.ssafy.withme;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableFeignClients
@EnableMongoRepositories
@EnableScheduling
@SpringBootApplication
public class LeadMeApplication {

	public static void main(String[] args) {
		SpringApplication.run(LeadMeApplication.class, args);
	}

}

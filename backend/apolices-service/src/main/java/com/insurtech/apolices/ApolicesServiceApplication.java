package com.insurtech.apolices;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ApolicesServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApolicesServiceApplication.class, args);
	}

}

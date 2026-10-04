package com.insurtech.segurados;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class SeguradosServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(SeguradosServiceApplication.class, args);
	}

}

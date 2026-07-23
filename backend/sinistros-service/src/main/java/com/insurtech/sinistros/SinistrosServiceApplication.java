package com.insurtech.sinistros;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class SinistrosServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(SinistrosServiceApplication.class, args);
	}

}

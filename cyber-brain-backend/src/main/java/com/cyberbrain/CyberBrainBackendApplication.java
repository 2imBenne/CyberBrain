package com.cyberbrain;

import com.cyberbrain.config.DatabaseUrlEnvironmentInitializer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CyberBrainBackendApplication {

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(CyberBrainBackendApplication.class);
		app.addInitializers(new DatabaseUrlEnvironmentInitializer());
		app.run(args);
	}

}

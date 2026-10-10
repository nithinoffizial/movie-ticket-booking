package com.example.movieticketbooking.config;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Initializes test environment properties by safely reading the untracked .env file
 * at the project root if present, without logging or exposing secrets.
 */
public class TestEnvInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        File envFile = findEnvFile();
        if (envFile != null && envFile.exists()) {
            Map<String, Object> envProperties = new HashMap<>();
            try {
                List<String> lines = Files.readAllLines(envFile.toPath());
                for (String line : lines) {
                    line = line.trim();
                    if (!line.isEmpty() && !line.startsWith("#") && line.contains("=")) {
                        int eqIdx = line.indexOf('=');
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();
                        envProperties.put(key, value);
                    }
                }
                applicationContext.getEnvironment().getPropertySources()
                        .addFirst(new MapPropertySource("testDotenvProperties", envProperties));
            } catch (IOException ignored) {
            }
        }
    }

    private File findEnvFile() {
        File dir = new File(System.getProperty("user.dir", "."));
        for (int i = 0; i < 4; i++) {
            File candidate = new File(dir, ".env");
            if (candidate.exists()) {
                return candidate;
            }
            dir = dir.getParentFile();
            if (dir == null) break;
        }
        return null;
    }
}

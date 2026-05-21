package com.example.backend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class GHNConfig {
    private static final Logger logger = LoggerFactory.getLogger(GHNConfig.class);

    @Value("${ghn.token}")
    private String token;

    @Value("${ghn.shopId}")
    private Integer shopId;

    @Value("${ghn.baseUrl}")
    private String baseUrl;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public String ghnToken() {
        return token;
    }

    @Bean
    public Integer ghnShopId() {
        return shopId;
    }

    @Bean
    public String ghnBaseUrl() {
        return baseUrl;
    }

    @PostConstruct
    public void printDebug() {
        logger.info("GHN Token: {}", token);
        logger.info("Shop ID: {}", shopId);
        logger.info("Base URL: {}", baseUrl);
    }
}


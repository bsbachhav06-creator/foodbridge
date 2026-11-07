package com.foodbridge.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@foodbridge.local");
            message.setTo(to);
            message.setSubject("[FoodBridge] " + subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("Sent email to {} with subject '{}'", to, subject);
        } catch (Exception e) {
            logger.warn("Could not send email to {}: {}. Continuing without blocking.", to, e.getMessage());
        }
    }
}

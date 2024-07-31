package com.ssafy.withme.global.config.jpa;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;

import java.util.Optional;

public class AuditorAwareImpl implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {

        Object principal;
        String username = null;

        try{
            principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        } catch (NullPointerException e){
            principal = null;
        }

        if (principal == null){
            username = "ADMIN";
        }

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        }

        return Optional.of(username);
    }
}

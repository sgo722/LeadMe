package com.ssafy.withme.dto.oauth;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.user.constant.RoleType;
import com.ssafy.withme.domain.user.constant.UserStatus;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

public class GoogleResponse implements OAuth2Response{

    private final Map<String, Object> attributes;

    public GoogleResponse(Map<String, Object> attributes) {
        System.out.println(attributes);
        this.attributes = attributes;
    }


    @Override
    public String getProvider() {
        return "google";
    }

    @Override
    public String getProviderId() {
        return attributes.get("sub").toString();
    }

    @Override
    public String getEmail() {
        return attributes.get("email").toString();
    }

    @Override
    public String getName() {
        return attributes.get("name").toString();
    }

    public String makeNickname() {
        String email = getEmail();
        return hashString(email);
    }

    private String hashString(String input) {
        MessageDigest digest = null;
        try {
            digest = MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
        byte[] hash = digest.digest(input.getBytes());
        StringBuilder hexString = new StringBuilder();

        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }

        return hexString.toString().substring(0, 10);
    }

    @Override
    public User toEntity() {

        return User.builder()
                .name(getName())
                .email(getEmail())
                .profileImg(attributes.get("picture").toString())
                .roleType(RoleType.USER)
                .userStatus(UserStatus.ACTIVE)
                .nickname(makeNickname())
                .build();
    }
}

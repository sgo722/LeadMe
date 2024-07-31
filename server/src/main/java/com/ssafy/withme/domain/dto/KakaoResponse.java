package com.ssafy.withme.domain.dto;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.user.constant.RoleType;
import com.ssafy.withme.domain.user.constant.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

@Slf4j
public class KakaoResponse implements OAuth2Response{

    private final Map<String, Object> attributes;
    private final Map<String, Object> kakaoAccount;
    private final Map<String, Object> profile;

    public KakaoResponse(Map<String, Object> attributes) {
        this.attributes = attributes;

        System.out.println("??들어오나");
        System.out.println(attributes);

        log.debug("attribute: {}", attributes.get("kakao_account"));
        this.kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        this.profile = (Map<String, Object>) kakaoAccount.get("profile");
    }

    @Override
    public String getProvider() {
        return "kakao";
    }

    @Override
    public String getProviderId() {
        return attributes.get("id").toString();
    }

    @Override
    public String getEmail() {
        return kakaoAccount.get("email").toString();
    }

    @Override
    public String getName() {
        return profile.get("nickname").toString();
    }

    public String makeNickname() {
        String name = getName();
        return hashString(name);
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

        String email = this.getEmail();
        String name = this.getName();

        return User.builder()
                .email(email)
                .name(name)
                .userStatus(UserStatus.ACTIVE)
                .profileImg(profile.get("profile_image_url").toString())
                .roleType(RoleType.USER)
                .nickname(makeNickname())
                .build();
    }
}

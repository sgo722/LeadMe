package com.ssafy.withme.dto;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.user.constant.RoleType;
import com.ssafy.withme.domain.user.constant.UserStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter @Builder
@AllArgsConstructor
public class UserInfoDto {

    private Long id;

    private String name;

    private String nickname;

    private String email;

    private String gender;

    private String age;

    @Enumerated(EnumType.STRING)
    private RoleType roleType;

    private String profileImg;

    private String profileComment;

    private LocalDateTime loginDateTime;

    @Enumerated(EnumType.STRING)
    private UserStatus userStatus;

    public static UserInfoDto from(User user){

        return UserInfoDto.builder()
                .id(user.getId())
                .name(user.getName())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .age(user.getAge())
                .gender(user.getGender())
                .profileImg(user.getProfileImg())
                .profileComment(user.getProfileComment())
                .loginDateTime(user.getLoginDateTime())
                .userStatus(user.getUserStatus())
                .roleType(user.getRoleType())
                .build();
    }
}

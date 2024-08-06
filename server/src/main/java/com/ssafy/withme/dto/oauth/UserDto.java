package com.ssafy.withme.dto.oauth;

import com.ssafy.withme.domain.user.constant.UserStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto {

    private String name;
    private String email;
    private UserStatus userStatus;
}

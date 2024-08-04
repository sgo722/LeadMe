package com.ssafy.withme.dto;

import com.ssafy.withme.domain.user.User;

public record SearchUserDto(Long id, String nickname) {

    public static SearchUserDto fromUser(User user) {

        return new SearchUserDto(user.getId(), user.getNickname());
    }
}

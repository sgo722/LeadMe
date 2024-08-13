package com.ssafy.withme.dto.user;

import com.ssafy.withme.domain.user.User;

public record FollowDto(Long id, String nickname, String profileImg) {

    public static FollowDto from(User user){

        return new FollowDto(user.getId(), user.getNickname(), user.getProfileImg());
    }
}

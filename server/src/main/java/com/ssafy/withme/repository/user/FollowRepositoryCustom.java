package com.ssafy.withme.repository.user;

public interface FollowRepositoryCustom {

    Long unfollow(Long toId, Long fromId);

    Boolean existsByFromUserIdAndToUserId(Long fromUserId, Long toUserId);
}

package com.ssafy.withme.repository.user;

import com.ssafy.withme.domain.user.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long>, FollowRepositoryCustom {

    @Override
    Boolean existsByFromUserIdAndToUserId(Long fromUserId, Long toUserId);

    @Override
    Long unfollow(Long toId, Long fromId);

    Optional<Follow> findByFromUserIdAndToUserId(Long fromUserId, Long toUserId);
}

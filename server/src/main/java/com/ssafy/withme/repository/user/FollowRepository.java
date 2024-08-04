package com.ssafy.withme.repository.user;

import com.ssafy.withme.domain.user.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowRepository extends JpaRepository<Follow, Long>, FollowRepositoryCustom {

    @Override
    Long unfollow(Long toId, Long fromId);
}

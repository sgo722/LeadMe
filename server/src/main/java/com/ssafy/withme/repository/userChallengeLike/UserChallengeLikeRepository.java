package com.ssafy.withme.repository.userChallengeLike;

import com.ssafy.withme.domain.userchallengeLike.UserChallengeLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserChallengeLikeRepository extends JpaRepository<UserChallengeLike, Long> {
    Optional<UserChallengeLike> findByUserIdAndUserChallengeId(Long userId, Long challengeId);
}

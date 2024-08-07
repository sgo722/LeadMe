package com.ssafy.withme.repository.userChallenge;

import com.ssafy.withme.domain.userchallenge.UserChallenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserChallengeRepository extends JpaRepository<UserChallenge, Long> {

    UserChallenge findByUuid(String uuid);

    Page<UserChallenge> findByAccessOrderByCreatedDateDesc(String access, Pageable pageable);

    Page<UserChallenge> findByUserIdOrderByCreatedDateDesc(Long userId, Pageable pageable);

    Page<UserChallenge> findByUserIdAndAccessOrderByCreatedDateDesc(Long userId, String access, Pageable pageable);
}

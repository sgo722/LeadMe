package com.ssafy.withme.repository.userchallenge;

import com.ssafy.withme.domain.userchallenge.UserChallenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserChallengeRepository extends JpaRepository<UserChallenge, Long> {

    UserChallenge findByUuid(String uuid);

    Page<UserChallenge> findByAccessOrderByCreatedDateDesc(String access, Pageable pageable);
}

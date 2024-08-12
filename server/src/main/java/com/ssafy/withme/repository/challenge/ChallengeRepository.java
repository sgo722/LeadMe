package com.ssafy.withme.repository.challenge;

import com.ssafy.withme.domain.challenge.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    /**
     * 유튜브 ID로 챌린지 조회
    */
    Challenge findByYoutubeId(String youtubeId);

    @Query("select c.youtubeId from Challenge c")
    List<String> findAllYoutubeId();
}

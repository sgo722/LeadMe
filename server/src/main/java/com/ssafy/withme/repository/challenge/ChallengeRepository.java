package com.ssafy.withme.repository.challenge;

import com.ssafy.withme.domain.challenge.Challenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    /**
     * 유튜브 ID로 챌린지 조회
     */
    Challenge findByYoutubeId(String youtubeId);

    Page<Challenge> findAll(Pageable pageable);

    Page<Challenge> findByTitle(Pageable pageable, String title);
}

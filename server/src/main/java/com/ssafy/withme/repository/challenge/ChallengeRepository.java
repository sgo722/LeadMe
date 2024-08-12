package com.ssafy.withme.repository.challenge;

import com.ssafy.withme.domain.challenge.Challenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    /**
     * 유튜브 ID로 챌린지 조회
     */
    Challenge findByYoutubeId(String youtubeId);


    Page<Challenge> findAll(Pageable pageable);


    @Query("select c.youtubeId from Challenge c where c.title like CONCAT('%', :title, '%')")
    List<String> findByTitleContaining(@Param("title") String title);

    @Query("select c from Challenge c where c.thumbnailUrl is null")
    List<Challenge> findAllWithThumbnailUrlIsNull();

    @Query("select c.youtubeId from Challenge c")
    List<String> findAllYoutubeId();

}

package com.ssafy.withme.repository.challengeHashtag;

import com.ssafy.withme.domain.challengeHashtag.ChallengeHashTag;
import com.ssafy.withme.domain.hashtag.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChallengeHashtagRepository extends JpaRepository<ChallengeHashTag, Long> {

    List<ChallengeHashTag> findAllByChallengeId(Long challengeId);
}

package com.ssafy.withme.repository.hashtag;

import com.ssafy.withme.domain.hashtag.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface hashtagRepository extends JpaRepository<Hashtag, Long> {
}

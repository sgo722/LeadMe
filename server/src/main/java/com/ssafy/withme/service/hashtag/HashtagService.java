package com.ssafy.withme.service.hashtag;

import com.ssafy.withme.controller.hashtag.request.HashtagCreateRequest;
import com.ssafy.withme.domain.hashtag.Hashtag;
import com.ssafy.withme.repository.hashtag.HashtagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class HashtagService {

    private final HashtagRepository hashtagRepository;

    public void save(HashtagCreateRequest request) {
        hashtagRepository.save(new Hashtag(request.getHashtagName()));
    }
}

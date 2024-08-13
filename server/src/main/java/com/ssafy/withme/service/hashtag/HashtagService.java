package com.ssafy.withme.service.hashtag;

import com.ssafy.withme.controller.hashtag.request.HashtagCreateRequest;
import com.ssafy.withme.domain.hashtag.Hashtag;
import com.ssafy.withme.repository.hashtag.HashtagRepository;
import com.ssafy.withme.service.hashtag.response.HashtagViewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class HashtagService {

    private final HashtagRepository hashtagRepository;

    public void save(HashtagCreateRequest request) {
        hashtagRepository.save(new Hashtag(request.getHashtagName()));
    }

    public List<HashtagViewResponse> findAll(){
        List<Hashtag> hashtagList = hashtagRepository.findAll();
        return hashtagList.stream()
                .map(hashtag -> HashtagViewResponse.toResponse(hashtag))
                .collect(Collectors.toList());
    }
}

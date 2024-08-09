package com.ssafy.withme.controller.hashtag;

import com.ssafy.withme.controller.hashtag.request.HashtagCreateRequest;
import com.ssafy.withme.domain.hashtag.Hashtag;
import com.ssafy.withme.service.hashtag.HashtagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class HashtagController {

    private final HashtagService hashtagService;

    @PostMapping("/api/v1/hashtag")
    public void save(@RequestBody HashtagCreateRequest request) {
        hashtagService.save(request);

    }

}

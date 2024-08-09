package com.ssafy.withme.controller.hashtag;

import com.ssafy.withme.controller.hashtag.request.HashtagCreateRequest;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.hashtag.HashtagService;
import com.ssafy.withme.service.hashtag.response.HashtagViewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
public class HashtagController {

    private final HashtagService hashtagService;

    @PostMapping("/api/v1/hashtag")
    public void save(@RequestBody HashtagCreateRequest request) {
        hashtagService.save(request);
    }

    @GetMapping("/api/v1/hashtag")
    public SuccessResponse<List<HashtagViewResponse>> findAllHashTag(){
        return SuccessResponse.of(hashtagService.findAll());

    }

}

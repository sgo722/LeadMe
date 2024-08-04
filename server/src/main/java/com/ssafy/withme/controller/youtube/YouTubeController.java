package com.ssafy.withme.controller.youtube;


import com.ssafy.withme.controller.youtube.request.YouTubeSearchRequest;
import com.ssafy.withme.controller.youtube.response.YouTubeSearchResponse;
import com.ssafy.withme.global.response.ApiResponse;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.youtube.YouTubeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
public class YouTubeController {

    private final YouTubeService youTubeService;

    @PostMapping("/api/v1/youtube")
    public ApiResponse<?> searchYouTube(@RequestBody YouTubeSearchRequest youTubeSearchRequest) throws Exception {

        return new SuccessResponse<>(youTubeService.searchYouTube(youTubeSearchRequest));
    }

}

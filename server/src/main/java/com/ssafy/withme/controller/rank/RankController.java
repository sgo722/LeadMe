package com.ssafy.withme.controller.rank;

import com.ssafy.withme.dto.rank.RankResponseDto;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.rank.RankService;
import com.ssafy.withme.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class RankController {

    private final RankService rankService;

    @GetMapping("/rank")
    public SuccessResponse<?> getRanking(@RequestParam("pageNo") Long pageNo) {

        List<RankResponseDto> rank = rankService.rankList(pageNo);

        return SuccessResponse.of(rank);
    }
}

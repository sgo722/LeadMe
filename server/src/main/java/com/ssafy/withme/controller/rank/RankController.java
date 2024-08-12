package com.ssafy.withme.controller.rank;

import com.ssafy.withme.dto.rank.RankResponseDto;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.rank.RankService;
import com.ssafy.withme.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.ssafy.withme.domain.rank.QRank.rank;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class RankController {

    private static final Logger log = LoggerFactory.getLogger(RankController.class);
    private final RankService rankService;
    private final UserService userService;

    @GetMapping("/rank/list")
    public SuccessResponse<?> getTotalUser() {

        Long totalUserCnt = (long) userService.findAll().size();

        return SuccessResponse.of(totalUserCnt);
    }

    @GetMapping("/rank")
    public SuccessResponse<?> getRanking(@RequestParam("pageNo") Long pageNo) {

        List<RankResponseDto> rank = rankService.rankList(pageNo);

        return SuccessResponse.of(rank);
    }

    // userChallengeLikeController에서 좋아요 수 반영하고 있기 때문에 안써도 됨...

//    @Scheduled(fixedRate = 1000 * 60 * 5)
//    public void updateRanking() {
//        log.info("update Ranking in 5 minutes");
//        rankService.updateLike();
//    }
}

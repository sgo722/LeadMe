package com.ssafy.withme.service.rank;

import com.ssafy.withme.dto.rank.RankResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RankService {

    private final RedisTemplate<String, String> redisTemplate;

    // Top Ranking 1~10위 출력
    public List<RankResponseDto> rankList() {
        String key = "ranking";
        ZSetOperations<String, String> zSetOperations = redisTemplate.opsForZSet();
        // like 순으로 10개 보여주기
        Set<ZSetOperations.TypedTuple<String>> typedTuples = zSetOperations.reverseRangeWithScores(key, 0, 9);
        return typedTuples.stream()
                .map(tuple -> new RankResponseDto(
                        tuple.getValue(), // userNickname
                        tuple.getScore().longValue(), // liked
                        0L // followers (임시값, 필요시 다른 데이터 소스에서 가져오기)
                ))
                .collect(Collectors.toList());
    }
}

package com.ssafy.withme.dto.rank;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RankResponseDto {

    private String userNickname;
    private Long liked;
    private Long followers;
}

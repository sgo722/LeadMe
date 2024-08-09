package com.ssafy.withme.dto.rank;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RankResponseDto {

    private Long userId;
    private String userNickname;
    private Long liked;
    private Long followers;
    private String profileImg;
}

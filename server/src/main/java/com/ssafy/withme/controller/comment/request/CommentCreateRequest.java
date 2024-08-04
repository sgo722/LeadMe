package com.ssafy.withme.controller.comment.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class CommentCreateRequest {

    private String content;

    private Long userChallengeId;

}

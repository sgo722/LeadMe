package com.ssafy.withme.controller.commentlike.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class CommentLikeDeleteRequest {

    private Long userId;

    private Long commentId;
}

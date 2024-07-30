package com.ssafy.withme.controller.commentlike.request;

import com.ssafy.withme.domain.commentLike.CommentLike;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class CommentLikeCreateRequest {

    private Long userId;

    private Long commentId;
}

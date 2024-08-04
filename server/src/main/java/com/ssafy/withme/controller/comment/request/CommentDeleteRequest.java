package com.ssafy.withme.controller.comment.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CommentDeleteRequest {

    private Long commentId;

    private Long userId;

}

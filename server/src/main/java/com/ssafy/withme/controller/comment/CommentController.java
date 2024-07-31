package com.ssafy.withme.controller.comment;

import com.ssafy.withme.controller.comment.request.CommentCreateRequest;
import com.ssafy.withme.controller.comment.request.CommentDeleteRequest;
import com.ssafy.withme.controller.comment.request.CommentUpdateRequest;
import com.ssafy.withme.domain.comment.Comment;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.global.annotation.CurrentUser;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.comment.CommentService;
import com.ssafy.withme.service.comment.response.CommentCreateResponse;
import com.ssafy.withme.service.comment.response.CommentDeleteResponse;
import com.ssafy.withme.service.comment.response.CommentUpdateResponse;
import com.ssafy.withme.service.comment.response.CommentViewResponse;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RequiredArgsConstructor
@RestController
public class CommentController {

    private final CommentService commentService;

    // 댓글을 조회한다. - 페이징 기능 처리해야함.
    @GetMapping("/api/v1/comment/{userChallengeId}")
    public List<CommentViewResponse> findByUserChallengeId(
            @PageableDefault(size = 10) Pageable pageable,
            @PathVariable Long userChallengeId) {

        return commentService.findCommentByChallengeId(pageable, userChallengeId);
    }

    // 댓글을 등록한다.
    @PostMapping("/api/v1/comment")
    public SuccessResponse<CommentCreateResponse> createComment(
            @CurrentUser User user,
            @RequestBody CommentCreateRequest request){
        return SuccessResponse.of(commentService.create(user, request));
    }

    // 댓글을 삭제한다.
    @DeleteMapping("/api/v1/comment")
    public SuccessResponse<CommentDeleteResponse> deleteComment(
            @CurrentUser User user,
            @RequestBody CommentDeleteRequest request){
        return SuccessResponse.of(commentService.delete(user, request));
    }

    // 댓글을 수정한다.
    @PutMapping("/api/v1/comment")
    public SuccessResponse<CommentUpdateResponse> updateComment(
            @CurrentUser User user,
            @RequestBody CommentUpdateRequest request){
        return SuccessResponse.of(commentService.update(user, request));
    }

}

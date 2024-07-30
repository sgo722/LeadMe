package com.ssafy.withme.service.commentlike;

import com.ssafy.withme.controller.commentlike.request.CommentLikeCreateRequest;
import com.ssafy.withme.domain.comment.Comment;
import com.ssafy.withme.domain.commentLike.CommentLike;
import com.ssafy.withme.repository.comment.CommentRepository;
import com.ssafy.withme.repository.commentlike.CommentLikeRepository;
import com.ssafy.withme.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class CommentLikeService {

    private final CommentLikeRepository commentLikeRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;


    public Integer create(CommentLikeCreateRequest request) {
        Long userId = request.getUserId();
        Long commentId = request.getCommentId();
        commentLikeRepository.findByUserIdAndCommentId(userId, commentId).ifPresent(like -> {
            throw new IllegalArgumentException("User has already liked this comment.");
                });

        Comment comment = commentRepository.findById(commentId).get();
        comment.clickLike();

//        User user = userRepository.findById(userId).get();

        CommentLike newCommentLike = CommentLike.builder()
                .comment(comment)
//                .user(user)
                .build();
        commentLikeRepository.save(newCommentLike);
        return comment.getLikes();
    }


}

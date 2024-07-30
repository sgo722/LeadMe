package com.ssafy.withme.repository.commentlike;

import com.ssafy.withme.domain.commentLike.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
}

package com.ssafy.withme.repository.user;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ssafy.withme.domain.user.QFollow;
import lombok.RequiredArgsConstructor;

import static com.ssafy.withme.domain.user.QFollow.follow;

@RequiredArgsConstructor
public class FollowRepositoryImpl implements FollowRepositoryCustom{

    private final JPAQueryFactory qf;

    @Override
    public Long unfollow(Long toId, Long fromId) {

        return qf.delete(follow)
                .where(follow.toUser.id.eq(toId), follow.fromUser.id.eq(fromId))
                .execute();
    }
}

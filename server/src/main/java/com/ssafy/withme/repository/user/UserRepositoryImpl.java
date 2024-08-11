package com.ssafy.withme.repository.user;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ssafy.withme.domain.user.QFollow;
import com.ssafy.withme.domain.user.QUser;
import com.ssafy.withme.domain.user.User;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

import static com.ssafy.withme.domain.user.QUser.user;

@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepositoryCustom{

    private final JPAQueryFactory qf;

    @Override
    public List<User> findByNameContaining(String name) {

        return qf.selectFrom(user)
                .where(user.name.containsIgnoreCase(name))
                .fetch();
    }

    @Override
    public Optional<User> findByNickname(String nickname) {

        return Optional.ofNullable(qf.selectFrom(user)
                .leftJoin(QFollow.follow).fetchJoin()
                .where(user.nickname.eq(nickname))
                .fetchOne()
        );
    }
}

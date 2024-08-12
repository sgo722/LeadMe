package com.ssafy.withme.repository.user;

import com.ssafy.withme.domain.user.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long>, UserRepositoryCustom {

//    @Query("select u from users u where u.email =:email")
    Optional<User> findByEmail(String email);

    @Override
    List<User> findByNameContaining(String name);

    Optional<User> findByName(String name);

    List<User> findByNicknameContaining(String nickname);

//    @Override
    @Query("SELECT DISTINCT u FROM users u left join fetch u.toFollowList f WHERE u.nickname = :nickname")
    Optional<User> findByNickname(@Param("nickname") String nickname);

    @Query("SELECT DISTINCT u FROM users u left join fetch u.toFollowList f ORDER BY u.userLikeCnt DESC")
//    @Query("SELECT u FROM users u JOIN u.fromFollowList f GROUP BY u ORDER BY u.userLikeCnt DESC")
//    @Override
    List<User> findTopUsersByLikes(Pageable pageable);
    // 유저를 좋아요 순으로 정렬하고 페이징 적용하여 가져오기
}

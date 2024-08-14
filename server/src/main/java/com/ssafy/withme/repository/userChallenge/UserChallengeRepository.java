package com.ssafy.withme.repository.userChallenge;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.userchallenge.UserChallenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserChallengeRepository extends JpaRepository<UserChallenge, Long> {

    UserChallenge findByUuid(String uuid);

    @Query("select uc from UserChallenge uc where uc.fileName like %:keyword% or uc.user.name like %:keyword%")
    List<UserChallenge> findByKeyword(@Param("keyword") String keyword);

    Page<UserChallenge> findByAccessOrderByCreatedDateDesc(String access, Pageable pageable);

    @Query("select uc from UserChallenge uc where uc.user.id = :userId order by uc.createdDate desc")
    Page<UserChallenge> findByUserOrderByCreatedDateDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("select uc from UserChallenge uc where uc.user.id = :userId and uc.access = :access order by uc.createdDate desc")
    Page<UserChallenge> findByUserAndAccessOrderByCreatedDateDesc(@Param("userId") Long userId, @Param("access") String access, Pageable pageable);
}

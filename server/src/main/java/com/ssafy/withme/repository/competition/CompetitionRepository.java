package com.ssafy.withme.repository.competition;

import com.ssafy.withme.domain.competition.Competition;
import com.ssafy.withme.domain.competition.constant.CompetitionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompetitionRepository extends JpaRepository<Competition, Integer> {

    @Query("select c from Competition c where c.status = :status")
    Page<Competition> findByStatus(@Param("status") CompetitionStatus status, Pageable pageable);

    @Query("select c from Competition c join fetch c.createUser where c in :competitions")
    List<Competition> fetchWithUser(@Param("competitions") List<Competition> competitions);


    Page<Competition> findByStatusAndRoomNameContains(CompetitionStatus status, String roomName, Pageable pageable);

    int countByStatusAndRoomNameContains(CompetitionStatus competitionStatus, String roomName);

    Competition findBySessionId(String sessionId);
}

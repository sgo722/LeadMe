package com.ssafy.withme.repository.competition;

import com.ssafy.withme.domain.competition.Competition;
import com.ssafy.withme.domain.competition.constant.CompetitionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompetitionRepository extends JpaRepository<Competition, Integer> {
    Page<Competition> findByStatus(CompetitionStatus status, Pageable pageable);

    Page<Competition> findByStatusAndRoomNameContains(CompetitionStatus status, String roomName, Pageable pageable);

    int countByStatusAndRoomNameContains(CompetitionStatus competitionStatus, String roomName);

    Competition findBySessionId(String sessionId);
}

package com.ssafy.withme.service.competition;

import com.ssafy.withme.repository.competition.CompetitionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CompetitionServiceTest {

    @Autowired
    private CompetitionService competitionService;
    @Autowired
    private CompetitionRepository competitionRepository;

    @Test
    @DisplayName("경쟁전 페이징 처리")
    void 경쟁전_페이징_처리() {

    }
}
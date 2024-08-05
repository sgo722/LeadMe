package com.ssafy.withme.service.competition;

import com.ssafy.withme.controller.competition.request.CompetitionCreateRequest;
import com.ssafy.withme.domain.competition.Competition;
import com.ssafy.withme.domain.competition.constant.CompetitionStatus;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.global.exception.EntityNotFoundException;
import com.ssafy.withme.repository.competition.CompetitionRepository;
import com.ssafy.withme.repository.user.UserRepository;
import com.ssafy.withme.service.competition.response.CompetitionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.ssafy.withme.global.error.ErrorCode.USER_NOT_EXISTS;

@RequiredArgsConstructor
@Service
public class CompetitionService {
    private final CompetitionRepository competitionRepository;
    private final UserRepository userRepository;

    /**
     * 세션 생성
     *
     * @param request
     * @param sessionId
     */
    public void create(CompetitionCreateRequest request, String sessionId, String userId) {

        User user = userRepository.findByEmail(userId)
                .orElseThrow(() -> new EntityNotFoundException(USER_NOT_EXISTS));

        Competition competition = Competition.builder()
                                .user(user)
                                .roomName(request.getRoomName())
                                .sessionId(sessionId)
                                .isPublic(request.isPublic())
                                .password(request.getPassword())
                                .build();

        competitionRepository.save(competition);
    }

    /**
     * OPEN 상태의 경쟁전만 페이징 처리하여 조회
     * @param pageNo
     * @param criteria
     * @param size
     * @return
     */
    public List<CompetitionResponse> getCompetitions(int pageNo, String criteria, int size, String searchKeyword) {

        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(Sort.Direction.DESC, criteria));
        Page<CompetitionResponse> page;
        if(searchKeyword != null && !searchKeyword.isEmpty()) {
            page = competitionRepository.findByStatus(CompetitionStatus.OPEN, pageable).map(CompetitionResponse :: toResponse);
        } else {
            page = competitionRepository.findAll(pageable).map(CompetitionResponse :: toResponse);
        }
        return page.getContent();
    }

    public int getTotlaCompetitions() {
        return competitionRepository.countByStatus(CompetitionStatus.OPEN);
    }
}

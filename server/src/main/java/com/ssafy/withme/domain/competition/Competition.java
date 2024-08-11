package com.ssafy.withme.domain.competition;

import com.ssafy.withme.domain.competition.constant.CompetitionStatus;
import com.ssafy.withme.domain.user.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Getter
public class Competition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "competition_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "create_user_id")
    private User createUser;

    private String roomName;

    private String sessionId;

    private boolean isPublic;

    private String password;

    @Enumerated(EnumType.STRING)
    private CompetitionStatus status;

    @CreationTimestamp
    private LocalDateTime createdDate;

    @Builder
    public Competition(User user, String roomName,
                       String sessionId, boolean isPublic,
                       String password) {
        this.createUser = user;
        this.roomName = roomName;
        this.sessionId = sessionId;
        this.isPublic = isPublic;
        this.password = password;
        this.status = CompetitionStatus.OPEN;
    }

    public CompetitionEditor.CompetitionEditorBuilder toEditor() {
        return CompetitionEditor.builder()
                .competitionStatus(status);
    }

    public void edit(CompetitionEditor competitionEditor) {
        status = competitionEditor.getCompetitionStatus();
    }
}

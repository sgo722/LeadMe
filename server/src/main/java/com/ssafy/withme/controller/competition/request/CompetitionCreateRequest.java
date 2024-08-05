package com.ssafy.withme.controller.competition.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
public class CompetitionCreateRequest {
    private String roomName;
    private String isPublic;
    private String password;

    public boolean isPublic() {
        return "true".equalsIgnoreCase(isPublic);
    }
}

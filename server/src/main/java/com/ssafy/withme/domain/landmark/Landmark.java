package com.ssafy.withme.domain.landmark;

import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "landmarks")
@NoArgsConstructor
@Setter
@Getter
@ToString
public class Landmark {

    @Id
    private String youtubeId;

    private List<List<Point>> landmarks;

    private Long challengeId;


    @Getter
    @Setter
    @ToString
    public static class Point{
        private Double x;
        private Double y;
        private Double z;
        private Double visibility;
    }


}
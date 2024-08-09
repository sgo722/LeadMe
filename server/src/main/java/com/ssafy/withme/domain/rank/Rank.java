package com.ssafy.withme.domain.rank;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
@Table(name = "`rank`")
public class Rank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rank_id")
    private Long id;

}

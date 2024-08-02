package com.ssafy.withme.repository.report;

import com.ssafy.withme.domain.report.Report;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReportRepository extends MongoRepository<Report, String> {
    Report findByUuid(String uuid);
}

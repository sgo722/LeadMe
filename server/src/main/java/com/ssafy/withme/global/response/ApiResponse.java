package com.ssafy.withme.global.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.gson.Gson;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@ToString
@Getter
public abstract class ApiResponse<T> {

    @Getter(onMethod_ = @JsonProperty("isSuccess"))
    private final boolean isSuccess;
    private final int code;
    private final String message;
    protected T data;
    protected List<CustomErrors> errors;

    public ApiResponse(boolean isSuccess, int code, String message) {
        this.isSuccess = isSuccess;
        this.code = code;
        this.message = message;
        this.data = null;
        this.errors = new ArrayList<>();
    }

    public String toJson() {
        return new Gson().toJson(this);
    }

}

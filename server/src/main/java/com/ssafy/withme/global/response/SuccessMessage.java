package com.ssafy.withme.global.response;

public record SuccessMessage(
        String Message
){
    public static SuccessMessage createSuccessMessage(String message) {
        return new SuccessMessage(message);
    }
}

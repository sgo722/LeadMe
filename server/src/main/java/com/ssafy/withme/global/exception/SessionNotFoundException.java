package com.ssafy.withme.global.exception;

import com.ssafy.withme.global.error.ErrorCode;

public class SessionNotFoundException extends BusinessException{

    public SessionNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}

package com.ssafy.withme.global.exception;

import com.ssafy.withme.global.error.ErrorCode;
import lombok.Getter;

@Getter
public class AuthorizationException extends  BusinessException{

    public AuthorizationException(ErrorCode errorCode) {
        super(errorCode);
    }
}

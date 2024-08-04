
package com.ssafy.withme.global.exception;

import com.ssafy.withme.global.error.ErrorCode;
import lombok.Getter;

@Getter
public class FileNotFoundException extends BusinessException{

    public FileNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}

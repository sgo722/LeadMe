package com.ssafy.withme.global.response;

import com.ssafy.withme.global.exception.BusinessException;
import lombok.Builder;
import lombok.Getter;
import net.minidev.json.annotate.JsonIgnore;
import org.springframework.http.HttpStatus;
import org.springframework.validation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class ErrorResponse extends ApiResponse<Void>{

    // Constructor
    public ErrorResponse(boolean isSuccess, int code, String message, Errors errors) {
        super(isSuccess, code, message);
        super.errors = parseErrors(errors);
    }

    // BusinessException 발생 시 Constructor
    public ErrorResponse(BusinessException exception) {
        this(false, exception.getErrorCode().getStatusCode(), exception.getMessage(), new SimpleErrors("error", exception.getMessage()));
    }

    // BusinessException + errorMessage
    public ErrorResponse(BusinessException exception, String message) {
        this(false, exception.getErrorCode().getStatusCode(), message, null);
    }

    public static ErrorResponse of(BusinessException exception) {
        return new ErrorResponse(exception);
    }

    public static ErrorResponse of(BusinessException exception, String message) {
        return new ErrorResponse(exception, message);
    }

    // Default Exception 발생 시 처리
    public static ErrorResponse of(Exception exception) {
        Errors errors = new MapBindingResult(new HashMap<>() , "");
        errors.reject("error.global", exception.getMessage());
        return new ErrorResponse(false, HttpStatus.INTERNAL_SERVER_ERROR.value(), exception.getMessage(), errors);
    }

    private List<CustomErrors> parseErrors(Errors errors) {

        ArrayList<CustomErrors> customErrors = new ArrayList<>();

        if(errors == null){
            return new ArrayList<>();
        }
        for (FieldError e: errors.getFieldErrors())
            customErrors.add(new CustomErrors(e.getField(), e.getDefaultMessage(), e.getCode(), e.getObjectName()));

        for (ObjectError e: errors.getGlobalErrors())
            customErrors.add(new CustomErrors(null, e.getDefaultMessage(), e.getCode(), e.getObjectName()));

        return customErrors;
    }



    @JsonIgnore
    @Override
    public Void getData() {
        return super.getData();
    }

    @JsonIgnore
    @Override
    public List<CustomErrors> getErrors() {
        return super.getErrors();
    }

    //    private String errorStatus;
//    private Integer errorCode;
//    private String errorMessage;
//
//    public static ErrorResponse of(String errorStatus, Integer errorCode, String errorMessage) {
//
//        return ErrorResponse.builder()
//                .errorStatus(errorStatus)
//                .errorCode(errorCode)
//                .errorMessage(errorMessage)
//                .build();
//    }
//
//    public static ErrorResponse of(String errorStatus, Integer errorCode, BindingResult bindingResult){
//        return ErrorResponse.builder()
//                .errorStatus(errorStatus)
//                .errorCode(errorCode)
//                .errorMessage(createErrorMessage(bindingResult))
//                .build();
//    }
//
//    public static String createErrorMessage(BindingResult bindingResult){
//
//        StringBuilder sb = new StringBuilder();
//        boolean isFirst = true;
//        List<FieldError> fieldErrors = bindingResult.getFieldErrors();
//
//        for (FieldError fieldError: fieldErrors){
//            if (!isFirst)
//                sb.append(", ");
//            else isFirst = false;
//
//            sb.append("[");
//            sb.append(fieldError.getField());
//            sb.append("]");
//            sb.append(fieldError.getDefaultMessage());
//        }
//
//        return sb.toString();
//    }
}

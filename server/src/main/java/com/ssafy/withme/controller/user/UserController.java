package com.ssafy.withme.controller.user;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.dto.UserInfoDto;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserService userService;

    @GetMapping("/user/me")
    public SuccessResponse<?> getInfo(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        User userInfo = null;
        if (authorization != null && authorization.startsWith("Bearer ")) {
//            String token = authorization.substring("Bearer ".length());
            String accessToken = authorization.split(" ")[1];

            userInfo = userService.findUserIdByToken(accessToken);
        }
        UserInfoDto userDto = UserInfoDto.from(userInfo);

        String name = SecurityContextHolder.getContext().getAuthentication().getName();

        log.info("name: {}", name);

        return SuccessResponse.of(userDto);
    }

    @GetMapping("/user/info/{id}")
    public SuccessResponse<?> getUserInfo(@PathVariable("id") Long id) {

        User findUser = userService.findById(id);

        UserInfoDto userInfo = UserInfoDto.from(findUser);

        return SuccessResponse.of(userInfo);
    }

    @GetMapping("/user/search")
    public ResponseEntity<List> findByName(@RequestParam("nickname") String nickname) {

        List<String> findList = userService.findListByNickname(nickname);

        return ResponseEntity.ok(findList);
    }


}

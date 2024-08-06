package com.ssafy.withme.controller.user;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.dto.user.SearchUserDto;
import com.ssafy.withme.dto.user.UserInfoDto;
import com.ssafy.withme.dto.user.UserUpdateDto;
import com.ssafy.withme.global.config.jwt.TokenProvider;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserService userService;
    private final TokenProvider tokenProvider;

    @GetMapping("/user/me")
    public SuccessResponse<?> getInfo(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        User userInfo = null;

        log.info("authorization: {}", authorization);

        if (authorization != null && authorization.startsWith("Bearer ")) {
//            String token = authorization.substring("Bearer ".length());
            String accessToken = authorization.split(" ")[1];

            userInfo = userService.findUserIdByToken(accessToken);
        }
        UserInfoDto userDto = UserInfoDto.from(userInfo);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        log.info("authentication: {}", authentication);

        return SuccessResponse.of(userDto);
    }

    @GetMapping("server/user/info/{id}")
    public SuccessResponse<?> getUserInfo(@PathVariable("id") Long id) {

        User findUser = userService.findById(id);

        UserInfoDto userInfo = UserInfoDto.from(findUser);

        return SuccessResponse.of(userInfo);
    }

    @GetMapping("/user/search")
    public SuccessResponse<List> findByName(@RequestParam("nickname") String nickname) {

        List<SearchUserDto> findList = userService.findListByNickname(nickname);

        log.info("findList: {}", findList);

        if (nickname.equals(""))
            return SuccessResponse.of(new ArrayList());

        return SuccessResponse.of(findList);
    }

    @PostMapping("/user/logout")
    public SuccessResponse<Long> logout(@RequestHeader("Authorization") String authorization) {

        String accessToken = authorization.split(" ")[1];

        Long expiration = tokenProvider.addToBlackList(accessToken);

        return SuccessResponse.of(expiration);
    }

    // 닉네임 중복여부 확인
    @GetMapping("/user/check")
    public boolean checkNickname(
            @RequestHeader("Authorization") String authorization,
            @RequestParam("nickname") String nickname) {

        return userService.findByNickname(nickname);
    }

    // 프로필 수정
    @PatchMapping("/user/profile/save")
    public SuccessResponse<?> saveProfile(
            @RequestHeader("Authorization") String authorization,
            @RequestBody UserUpdateDto userUpdateDto) {
        String accessToken = authorization.split(" ")[1];

        log.info(userUpdateDto.getNickname() + " " + userUpdateDto.getProfileComment());
        userService.updateUser(accessToken, userUpdateDto);

        return SuccessResponse.of("OK");
    }
}

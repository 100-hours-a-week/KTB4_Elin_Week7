package community.api.controller;

import community.api.dto.UserRequestDto;
import community.api.dto.UserResponseDto;
import community.api.response.ApiResponse;
import community.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponseDto.Register>> register(
            @Valid @RequestBody UserRequestDto.Register request
    ) {
        UserResponseDto.Register response = userService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of("register_success", response));
    }

    @PostMapping("/users/sessions")
    public ResponseEntity<ApiResponse<UserResponseDto.Login>> login(
            @Valid @RequestBody UserRequestDto.Login request
    ) {
        UserResponseDto.Login response = userService.login(request);

        return ResponseEntity.ok(
                ApiResponse.of("login_success", response)
        );
    }

    @GetMapping("/users/profile")
    public ResponseEntity<ApiResponse<UserResponseDto.Profile>> getProfile(
            @RequestHeader(value = "X-USER-ID", required = false) Long userId
    ) {
        UserResponseDto.Profile response =
                userService.getProfile(userId);

        return ResponseEntity.ok(
                ApiResponse.of("profile_get_success", response)
        );
    }

    @DeleteMapping("/users/profile")
    public ResponseEntity<Void> deleteUser(
            @RequestHeader(value = "X-USER-ID", required = false) Long userId
    ) {
        userService.deleteUser(userId);

        return ResponseEntity.noContent().build();
    }
    @PatchMapping("/users/profile")
    public ResponseEntity<ApiResponse<UserResponseDto.UpdateProfile>> updateProfile(
            @RequestHeader(value = "X-USER-ID", required = false) Long userId,
            @Valid @RequestBody UserRequestDto.UpdateProfile request){
        UserResponseDto.UpdateProfile response = userService.updateProfile(userId, request);

        return ResponseEntity.ok(ApiResponse.of("profile_update_success", response));
    }

    @PatchMapping("/users/password")
    public ResponseEntity<ApiResponse<UserResponseDto.UpdatePassword>> updatePassword(
            @RequestHeader(value = "X-USER-ID", required = false) Long userId,
            @Valid @RequestBody UserRequestDto.UpdatePassword request) {
        UserResponseDto.UpdatePassword response = userService.updatePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.of("password_update_success", response));
    }
}
package community.api.service;

import community.api.dto.UserRequestDto;
import community.api.dto.UserResponseDto;
import community.api.entity.User;
import community.api.exception.ConflictException;
import community.api.exception.NotFoundException;
import community.api.exception.UnauthorizedException;
import community.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;

    @Transactional
    public UserResponseDto.Register register(UserRequestDto.Register request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("duplicated_email");
        }
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new ConflictException("duplicated_nickname");
        }

        User user = new User(
                request.getEmail(),
                request.getPassword(),
                request.getNickname(),
                request.getProfileImage()
        );

        User savedUser = userRepository.save(user);

        return UserResponseDto.Register.from(savedUser);
    }

    public UserResponseDto.Login login(UserRequestDto.Login request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail());

        if (user == null) {
            throw new UnauthorizedException("login_failed");
        }

        if (!user.getPassword().equals(request.getPassword())) {
            throw new UnauthorizedException("login_failed");
        }

        return UserResponseDto.Login.from(user);
    }

    public UserResponseDto.Profile getProfile(Long userId) {
        if (userId == null) {
            throw new UnauthorizedException("unauthorized_error");
        }

        User user = userRepository.findById(userId)
                .filter(foundUser -> foundUser.getDeletedAt() == null)
                .orElseThrow(() -> new NotFoundException("user_not_found"));

        return UserResponseDto.Profile.from(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (userId == null) {
            throw new UnauthorizedException("unauthorized_error");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("user_not_found"));

        user.delete();
    }

    @Transactional
    public UserResponseDto.UpdateProfile updateProfile(Long userId, UserRequestDto.UpdateProfile request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("user_not_found"));

        if (request.getNickname() != null) {
            if (!request.getNickname().equals(user.getNickname()) && userRepository.existsByNickname(request.getNickname())) {
                throw new ConflictException("duplicated_nickname");
            }
        }
        user.updateProfile(
                request.getNickname(),
                request.getProfileImage()
        );
        return UserResponseDto.UpdateProfile.from(user);
    }
    @Transactional
    public UserResponseDto.UpdatePassword updatePassword(Long userId, UserRequestDto.UpdatePassword request) {
        if (userId == null) {
            throw new UnauthorizedException("unauthorized_error");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("user_not_found"));

        user.updatePassword(request.getPassword());

        return UserResponseDto.UpdatePassword.from(user);
    }
}
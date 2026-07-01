package community.api.controller;

import community.api.dto.PostRequestDto;
import community.api.dto.PostResponseDto;
import community.api.response.ApiResponse;
import community.api.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @PostMapping
    public ResponseEntity<ApiResponse<PostResponseDto>> createPost(
            @RequestHeader(value = "X-USER-ID", required = false) Long userId,
            @Valid @RequestBody PostRequestDto request
    ) {
        PostResponseDto response = postService.createPost(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.of("post_create_success", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponseDto>>> getPosts(
            @RequestHeader(value = "X-USER-ID", required = false) Long userId
    ) {
        List<PostResponseDto> response = postService.getPosts(userId);

        return ResponseEntity.ok(
                ApiResponse.of("post_list_success", response)
        );
    }

    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostResponseDto>> getPost(
            @PathVariable Long postId
    ) {
        PostResponseDto response = postService.getPost(postId);

        return ResponseEntity.ok(
                ApiResponse.of("post_detail_success", response)
        );
    }

    @PatchMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostResponseDto>> updatePost(
            @RequestHeader(value = "X-USER-ID", required = false) Long userId,
            @PathVariable Long postId,
            @Valid @RequestBody PostRequestDto request
    ) {
        PostResponseDto response = postService.updatePost(userId, postId, request);

        return ResponseEntity.ok(
                ApiResponse.of("post_update_success", response)
        );
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @RequestHeader(value = "X-USER-ID", required = false) Long userId,
            @PathVariable Long postId
    ) {
        postService.deletePost(userId, postId);

        return ResponseEntity.noContent().build();
    }
}
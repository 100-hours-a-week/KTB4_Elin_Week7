package community.api.service;
import community.api.repository.PostCountProjection;
import community.api.dto.PostRequestDto;
import community.api.dto.PostResponseDto;
import community.api.entity.Post;
import community.api.entity.User;
import community.api.exception.ForbiddenException;
import community.api.exception.NotFoundException;
import community.api.exception.UnauthorizedException;
import community.api.repository.CommentRepository;
import community.api.repository.LikeRepository;
import community.api.repository.PostRepository;
import community.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;

    @Transactional
    public PostResponseDto createPost(Long userId, PostRequestDto request) {
        if (userId == null) {
            throw new UnauthorizedException("unauthorized_error");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("user_not_found"));

        Post post = new Post(
                user,
                request.getTitle(),
                request.getContent(),
                request.getContentImage()
        );

        Post savedPost = postRepository.save(post);

        return toResponseDto(savedPost);
    }

    public List<PostResponseDto> getPosts(Long userId) {
        if (userId == null) {
            throw new UnauthorizedException("unauthorized_error");
        }

        List<Post> posts = postRepository.findAllBy();

        if (posts.isEmpty()) {
            return List.of();
        }

        List<Long> postIds = posts.stream()
                .map(Post::getId)
                .toList();

        Map<Long, Long> likeCountMap = likeRepository.countByPostIds(postIds)
                .stream()
                .collect(Collectors.toMap(
                        PostCountProjection::getPostId,
                        PostCountProjection::getCountValue
                ));

        Map<Long, Long> commentCountMap = commentRepository.countByPostIds(postIds)
                .stream()
                .collect(Collectors.toMap(
                        PostCountProjection::getPostId,
                        PostCountProjection::getCountValue
                ));

        return posts.stream()
                .map(post -> {
                    int likeCount = likeCountMap
                            .getOrDefault(post.getId(), 0L)
                            .intValue();

                    int commentCount = commentCountMap
                            .getOrDefault(post.getId(), 0L)
                            .intValue();

                    return PostResponseDto.from(
                            post,
                            post.getUser(),
                            likeCount,
                            commentCount
                    );
                })
                .toList();
    }
    @Transactional
    public PostResponseDto getPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(()-> new NotFoundException("post_not_found"));

        post.increaseViewCount();
        return toResponseDto(post);
    }
    @Transactional
    public PostResponseDto updatePost(Long userId, Long postId, PostRequestDto request) {
        if (userId == null) {
            throw new UnauthorizedException("unauthorized_error");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("post_not_found"));

        if (!post.getUserId().equals(userId)) {
            throw new ForbiddenException("forbidden_error");
        }

        post.update(
                request.getTitle(),
                request.getContent(),
                request.getContentImage()
        );

        return toResponseDto(post);
    }
    @Transactional
    public void deletePost(Long userId, Long postId) {
        if (userId == null) {
            throw new UnauthorizedException("unauthorized_error");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(()-> new NotFoundException("post_not_found"));

        if (!post.getUserId().equals(userId)) {
            throw new ForbiddenException("forbidden_error");
        }

        commentRepository.deleteByPost_Id(postId);
        likeRepository.deleteByPost_Id(postId);
        postRepository.deleteById(postId);
    }

    private PostResponseDto toResponseDto(Post post) {
        User user = post.getUser();

        int likeCount = (int) likeRepository.countByPost_Id(post.getId());
        int commentCount = (int) commentRepository.countByPost_Id(post.getId());

        return PostResponseDto.from(post, user, likeCount, commentCount);
    }
}
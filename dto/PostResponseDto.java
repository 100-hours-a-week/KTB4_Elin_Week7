package community.api.dto;

import community.api.entity.Post;
import community.api.entity.User;
import lombok.Getter;
import java.time.LocalDateTime;
@Getter
public class PostResponseDto {

    private Long postId;
    private Long userId;
    private String nickname;
    private String profileImage;
    private String title;
    private String content;
    private String contentImage;
    private int viewCount;
    private int likeCount;
    private int commentCount;
    private LocalDateTime createdAt;

    public PostResponseDto(Long postId, Long userId, String nickname, String profileImage, String title, String content, String contentImage, int viewCount, int likeCount, int commentCount, LocalDateTime createdAt) {
        this.postId = postId;
        this.userId = userId;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.title = title;
        this.content = content;
        this.contentImage = contentImage;
        this.viewCount = viewCount;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
        this.createdAt = createdAt;

    }

    public static PostResponseDto from(Post post, User user, int likeCount, int commentCount) {
        boolean deletedUser = user.getDeletedAt() != null;

        Long userId = deletedUser ? null : user.getId();
        String nickname = deletedUser ? "탈퇴한 사용자" : user.getNickname();
        String profileImage = deletedUser ? null : user.getProfileImage();

        return new PostResponseDto(
                post.getId(),
                userId,
                nickname,
                profileImage,
                post.getTitle(),
                post.getContent(),
                post.getContentImage(),
                post.getViewCount(),
                likeCount,
                commentCount,
                post.getCreatedAt()
        );
    }
}
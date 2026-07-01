package community.api.repository;

import community.api.entity.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = "user")
    List<Comment> findAllByPost_IdAndDeletedAtIsNull(Long postId);

    long countByPost_Id(Long postId);

    void deleteByPost_Id(Long postId);
    @Query(value = """
    select
            post_id as postId,
            count(comment_id) as countValue
        from comments
        where post_id in (:postIds)
        group by post_id
    """, nativeQuery = true)
        List<PostCountProjection> countByPostIds(@Param("postIds") List<Long> postIds);
}
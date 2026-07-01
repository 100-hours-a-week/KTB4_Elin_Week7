package community.api.repository;

import community.api.entity.Post;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    @EntityGraph(attributePaths = "user")
    List<Post> findAllBy();
}
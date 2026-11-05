package com.bapmeokja.api.community;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, String> {
    @EntityGraph(attributePaths = "user")
    List<CommunityComment> findAllByPost_IdOrderByCreatedAtAsc(String postId);

    @EntityGraph(attributePaths = {"user", "post"})
    Optional<CommunityComment> findByIdAndPost_Id(String id, String postId);

    List<CommunityComment> findAllByPost_IdAndParentId(String postId, String parentId);

    void deleteAllByPost_Id(String postId);
}

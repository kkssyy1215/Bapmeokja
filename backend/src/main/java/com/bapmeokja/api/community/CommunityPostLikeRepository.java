package com.bapmeokja.api.community;

import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommunityPostLikeRepository extends JpaRepository<CommunityPostLike, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<CommunityPostLike> findByPost_IdAndUser_Id(String postId, Long userId);

    boolean existsByPost_IdAndUser_Id(String postId, Long userId);

    void deleteAllByPost_Id(String postId);

    /** 목록에 보이는 게시글 중 이 사용자가 좋아요를 누른 게시글 id만 한 번에 가져온다. */
    @Query("select l.post.id from CommunityPostLike l where l.user.id = :userId and l.post.id in :postIds")
    List<String> findLikedPostIds(@Param("userId") Long userId, @Param("postIds") Collection<String> postIds);
}

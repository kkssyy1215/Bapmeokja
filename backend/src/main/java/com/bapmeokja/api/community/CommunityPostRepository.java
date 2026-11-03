package com.bapmeokja.api.community;

import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, String> {
    @EntityGraph(attributePaths = "user")
    Page<CommunityPost> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Optional<CommunityPost> findById(String id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = "user")
    @Query("select post from CommunityPost post where post.id = :id")
    Optional<CommunityPost> findLockedById(@Param("id") String id);

    @Query("select post.imageUrl from CommunityPost post where post.user.id = :userId and post.imageUrl is not null")
    List<String> findImageUrlsByUserId(@Param("userId") Long userId);

    // 탈퇴자의 좋아요·댓글은 FK cascade로 지워지므로, 지워지기 전에 다른 사람 글의 카운터에서 먼저 뺀다.
    @Modifying
    @Query(value = """
            update posts p set
                like_count = greatest(like_count
                    - (select count(*) from post_likes l where l.post_id = p.id and l.user_id = :userId), 0),
                comment_count = greatest(comment_count
                    - (select count(*) from comments c where c.post_id = p.id and c.user_id = :userId), 0)
            where p.user_id <> :userId
            """, nativeQuery = true)
    void releaseCountersOfUser(@Param("userId") Long userId);
}

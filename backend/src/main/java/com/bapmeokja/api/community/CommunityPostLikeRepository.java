package com.bapmeokja.api.community;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface CommunityPostLikeRepository extends JpaRepository<CommunityPostLike, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<CommunityPostLike> findByPost_IdAndUser_Id(String postId, Long userId);

    boolean existsByPost_IdAndUser_Id(String postId, Long userId);

    void deleteAllByPost_Id(String postId);
}

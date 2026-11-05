-- 대댓글: 어떤 댓글에 달린 답글인지 기록한다. 답글은 한 단계만 둔다.
ALTER TABLE comments
    ADD COLUMN parent_id VARCHAR(40) NULL,
    ADD INDEX idx_comments_parent (parent_id);

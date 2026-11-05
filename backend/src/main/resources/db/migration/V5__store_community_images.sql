-- 배포 서버의 디스크는 재시작하면 비워지므로 커뮤니티 사진을 DB에 저장한다.
CREATE TABLE community_images (
    file_name VARCHAR(60) NOT NULL,
    content_type VARCHAR(40) NOT NULL,
    data MEDIUMBLOB NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (file_name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

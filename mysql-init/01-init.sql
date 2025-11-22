-- Create test database for running tests
CREATE DATABASE IF NOT EXISTS conduit_test;
GRANT ALL PRIVILEGES ON conduit_test.* TO 'conduit'@'%';

-- Ensure proper charset and collation
ALTER DATABASE conduit_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER DATABASE conduit_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

FLUSH PRIVILEGES;
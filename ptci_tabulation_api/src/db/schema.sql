-- IC2 Tabulation — reference schema (MySQL 8 / MariaDB 10.4+)
-- The API creates these automatically on startup (src/db/initSchema.ts);
-- this file is for phpMyAdmin imports or manual inspection.

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'judge') NOT NULL,
  has_submitted TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  password_changed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_username (username),
  KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contestants (
  cand_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cand_number VARCHAR(8) NOT NULL,
  cand_name VARCHAR(128) NOT NULL,
  cand_team ENUM('black', 'white', 'purple', 'green', 'red') NOT NULL,
  cand_gender ENUM('male', 'female', 'other') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (cand_id),
  UNIQUE KEY uq_gender_number (cand_gender, cand_number),
  KEY idx_gender (cand_gender)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One table per judged category. judge_id is ON DELETE RESTRICT: a judge who has scored
-- cannot be deleted (deactivate instead); cand_id cascades. Criteria maxima (enforced by the API):
--   talent     : mastery 30, performance_choreography 40, overall_impression 20, audience_impact 10

CREATE TABLE IF NOT EXISTS scores_talent (
  score_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  judge_id INT UNSIGNED NOT NULL,
  cand_id INT UNSIGNED NOT NULL,
  mastery DECIMAL(5,2) NOT NULL,
  performance_choreography DECIMAL(5,2) NOT NULL,
  overall_impression DECIMAL(5,2) NOT NULL,
  audience_impact DECIMAL(5,2) NOT NULL,
  total_score DECIMAL(6,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (score_id),
  UNIQUE KEY uq_judge_cand (judge_id, cand_id),
  KEY idx_cand (cand_id),
  CONSTRAINT fk_talent_judge FOREIGN KEY (judge_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_talent_cand FOREIGN KEY (cand_id) REFERENCES contestants (cand_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NULL,
  username VARCHAR(64) NOT NULL DEFAULT '',
  action VARCHAR(64) NOT NULL,
  details VARCHAR(512) NOT NULL DEFAULT '',
  ip VARCHAR(64) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_created_at (created_at),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

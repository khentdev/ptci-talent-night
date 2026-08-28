import { CATEGORIES, CATEGORY_KEYS } from '../scoring/categories.js'
import { closePool, getPool } from './pool.js'

const TABLE_OPTS = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'

/** One scores table per category, generated from scoring/categories.ts. */
function scoresTableStatement(key: (typeof CATEGORY_KEYS)[number]): string {
  const cat = CATEGORIES[key]
  const criteriaColumns = cat.criteria.map((c) => `    ${c.column} DECIMAL(5,2) NOT NULL,`).join('\n')
  const fk = cat.table.replace(/^scores_/, '')
  return `CREATE TABLE IF NOT EXISTS ${cat.table} (
    score_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    judge_id INT UNSIGNED NOT NULL,
    cand_id INT UNSIGNED NOT NULL,
${criteriaColumns}
    total_score DECIMAL(6,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (score_id),
    UNIQUE KEY uq_judge_cand (judge_id, cand_id),
    KEY idx_cand (cand_id),
    CONSTRAINT fk_${fk}_judge FOREIGN KEY (judge_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_${fk}_cand FOREIGN KEY (cand_id) REFERENCES contestants (cand_id) ON DELETE CASCADE
  ) ${TABLE_OPTS}`
}

export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
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
  ) ${TABLE_OPTS}`,
  `CREATE TABLE IF NOT EXISTS contestants (
    cand_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    cand_number VARCHAR(8) NOT NULL,
    cand_name VARCHAR(128) NOT NULL,
    cand_team ENUM('red', 'yellow', 'green', 'purple', 'blue') NOT NULL,
    cand_gender ENUM('male', 'female', 'other') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (cand_id),
    UNIQUE KEY uq_gender_number (cand_gender, cand_number),
    KEY idx_gender (cand_gender)
  ) ${TABLE_OPTS}`,
  ...CATEGORY_KEYS.map(scoresTableStatement),
  `CREATE TABLE IF NOT EXISTS activity_logs (
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
  ) ${TABLE_OPTS}`,
]

/** Idempotent: safe to run on every boot (CREATE TABLE IF NOT EXISTS only). */
export async function initDatabaseSchema(): Promise<void> {
  const pool = getPool()
  for (const statement of SCHEMA_STATEMENTS) {
    await pool.query(statement)
  }
}

// `npm run db:init` — create the tables without starting the server.
const invokedDirectly = process.argv[1]?.replace(/\\/g, '/').endsWith('/src/db/initSchema.ts')
if (invokedDirectly) {
  initDatabaseSchema()
    .then(async () => {
      console.log(`Schema ready (${SCHEMA_STATEMENTS.length} tables checked).`)
      await closePool()
    })
    .catch(async (err) => {
      console.error('Schema init failed:', err)
      await closePool()
      process.exit(1)
    })
}

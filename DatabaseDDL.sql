CREATE DATABASE IF NOT EXISTS money_radar;

USE money_radar;

-- 1. USERS & PROFILE (Sign Up, Sign In, & My Radar Profile)
CREATE TABLE users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL, -- NULL if signing in exclusively via Google OAuth
    google_id VARCHAR(255) NULL UNIQUE,
    
    -- Profile Questionnaire Fields
    employment_status VARCHAR(50) NULL,
    education_level VARCHAR(50) NULL,
    income_range VARCHAR(50) NULL,
    location VARCHAR(100) NULL,
    experience_level VARCHAR(50) NULL,
    current_goal VARCHAR(100) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. OPPORTUNITIES (Explore Tab & Modal Details)
CREATE TABLE opportunities (
    opportunity_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'texas-grant-program'
    title VARCHAR(255) NOT NULL,
    category ENUM('EDUCATION', 'EMPLOYMENT', 'OTHER') NOT NULL,
    opportunity_type VARCHAR(50) NOT NULL DEFAULT 'GRANT', -- e.g., GRANT, LOAN, BENEFIT
    amount_display VARCHAR(255) NOT NULL, -- e.g., 'Up to $5,429 per semester...'
    deadline_display VARCHAR(100) NOT NULL, -- e.g., 'January 15 2027' or 'Until funds are exhausted'
    deadline_date DATE NULL, -- Optional structured date for sorting/filtering
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. OPPORTUNITY ELIGIBILITY RULES (Bullet points in View Details Modal)
CREATE TABLE opportunity_eligibility (
    eligibility_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    opportunity_id INT UNSIGNED NOT NULL,
    rule_text VARCHAR(255) NOT NULL,
    sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
    
    CONSTRAINT fk_eligibility_opportunity
        FOREIGN KEY (opportunity_id) REFERENCES opportunities(opportunity_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. TAGS (Shared vocabulary for matching Users to Opportunities)
CREATE TABLE tags (
    tag_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'student', 'part-time', 'texas', 'under-30k'
    tag_group VARCHAR(50) NULL -- e.g., 'education', 'location', 'income'
) ENGINE=InnoDB;

-- Junction: Tags assigned to a user based on their profile questionnaire
CREATE TABLE user_tags (
    user_id INT UNSIGNED NOT NULL,
    tag_id INT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, tag_id),
    CONSTRAINT fk_user_tags_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_tags_tag
        FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- Junction: Tags attached to opportunities for discovery & My Radar matching
CREATE TABLE opportunity_tags (
    opportunity_id INT UNSIGNED NOT NULL,
    tag_id INT UNSIGNED NOT NULL,
    
    PRIMARY KEY (opportunity_id, tag_id),
    CONSTRAINT fk_opp_tags_opportunity
        FOREIGN KEY (opportunity_id) REFERENCES opportunities(opportunity_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_opp_tags_tag
        FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. COMPARE & SAVED QUEUE (Compare & Plan Tab)
CREATE TABLE user_opportunities (
    user_id INT UNSIGNED NOT NULL,
    opportunity_id INT UNSIGNED NOT NULL,
    status ENUM('SAVED', 'IN_COMPARISON') NOT NULL DEFAULT 'SAVED',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, opportunity_id),
    CONSTRAINT fk_user_opps_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_opps_opportunity
        FOREIGN KEY (opportunity_id) REFERENCES opportunities(opportunity_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. ACTIVE PURSUITS & CHECKLIST STEPS (Active Pursuits Tab)
CREATE TABLE user_pursuits (
    pursuit_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    opportunity_id INT UNSIGNED NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent a user from adding the exact same opportunity to Active Pursuits twice
    UNIQUE KEY uq_user_pursuit (user_id, opportunity_id),
    CONSTRAINT fk_pursuits_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_pursuits_opportunity
        FOREIGN KEY (opportunity_id) REFERENCES opportunities(opportunity_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pursuit_steps (
    step_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pursuit_id INT UNSIGNED NOT NULL,
    label VARCHAR(255) NOT NULL,
    is_checked BOOLEAN NOT NULL DEFAULT FALSE,
    step_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
    
    CONSTRAINT fk_steps_pursuit
        FOREIGN KEY (pursuit_id) REFERENCES user_pursuits(pursuit_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;
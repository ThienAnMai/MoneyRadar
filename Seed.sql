USE money_radar;

-- 1. INSERT DEMO USER (Matches your initial profile state)
-- Password hash below is a placeholder for 'password123' (generate real ones via bcrypt in Node)
INSERT INTO users (
    user_id, full_name, email, password_hash, 
    employment_status, education_level, income_range, location, experience_level, current_goal
) VALUES (
    1, 'Alex Rivera', 'demo@moneyradar.app', '$2b$10$ExampleBcryptHashStringHere12345678901234567890',
    'Part-time', 'Student', 'Under $30,000', 'Texas', 'Entry-level', 'Tuition support'
);

-- 2. INSERT TAGS (Mapped to profile questionnaire answers & opportunity criteria)
INSERT INTO tags (tag_id, name, tag_group) VALUES
    (1, 'part-time', 'employment'),
    (2, 'full-time', 'employment'),
    (3, 'student', 'education'),
    (4, 'under-30k', 'income'),
    (5, 'texas', 'location'),
    (6, 'entry-level', 'experience'),
    (7, 'tuition-support', 'goal');

-- Assign tags to Demo User 1 based on their profile
INSERT INTO user_tags (user_id, tag_id) VALUES
    (1, 1), -- part-time
    (1, 3), -- student
    (1, 4), -- under-30k
    (1, 5), -- texas
    (1, 6), -- entry-level
    (1, 7); -- tuition-support

-- 3. INSERT OPPORTUNITIES (All 6 items from your opportunitiesList)
INSERT INTO opportunities (
    opportunity_id, slug, title, category, opportunity_type, 
    amount_display, deadline_display, deadline_date, description
) VALUES
    (
        1, 'ed-grant-general', 'Education Grant', 'EDUCATION', 'GRANT',
        'Up to $1,000', '30 Nov 2026', '2026-11-30',
        'Example support for course fees and study materials. Review the provider’s full terms.'
    ),
    (
        2, 'texas-grant-program', 'Toward Excellence, Access & Success (TEXAS) Grant Program', 'EDUCATION', 'GRANT',
        'Up to $5,429 per semester or over $16,000 across an academic year depending on state allocations',
        'January 15 2027', '2027-01-15',
        'State-funded, need-based financial aid program established by the Texas Legislature to help eligible students with financial need attend public universities and health-related institutions in Texas.'
    ),
    (
        3, 'emp-benefit-general', 'Employment Benefit', 'EMPLOYMENT', 'BENEFIT',
        'Up to $500', '15 Dec 2026', '2026-12-15',
        'Work-related training costs and professional certification subsidies.'
    ),
    (
        4, 'federal-work-study', 'Federal Work-Study (FWS) program', 'EMPLOYMENT', 'PROGRAM',
        'Depends on FAFSA application', 'June 30 2027', '2027-06-30',
        'Part-time jobs tailored to a students class schedule, with earnings that can be structured around financial need.'
    ),
    (
        5, 'fin-support-texas', 'Financial Support', 'OTHER', 'TAX CREDIT',
        'Up to $750', '31 Dec 2026', '2026-12-31',
        'Direct state tax return support for residents meeting income criteria.'
    ),
    (
        6, 'frost-bank-loan', 'Frost Bank Program', 'OTHER', 'LOAN',
        '$8000 interest free loan', 'Until funds are exhausted', NULL,
        'Ernest A. Mantzel Foundation is offering an interest free loan to undergraduates and graduates enrolled full-time at any Texas College or University'
    );

-- 4. INSERT ELIGIBILITY RULES
INSERT INTO opportunity_eligibility (opportunity_id, rule_text, sort_order) VALUES
    -- 1: Education Grant
    (1, 'Enrolled in an eligible course', 1),
    (1, 'Income information required', 2),
    (1, 'Proof of enrolment required', 3),
    -- 2: TEXAS Grant Program
    (2, 'Enrolled in 3/4 time', 1),
    (2, 'Income information required', 2),
    (2, 'Proof of enrollment in first undergraduate degree required', 3),
    -- 3: Employment Benefit
    (3, 'Part-time or full-time employment status', 1),
    (3, 'Employer approval letter', 2),
    -- 4: Federal Work-Study
    (4, 'FAFSA application', 1),
    (4, 'Enrolled in University, College, or Trade School', 2),
    -- 5: Financial Support
    (5, 'Resident in Texas', 1),
    (5, 'Income under $30,000', 2),
    -- 6: Frost Bank Program
    (6, 'Resident in Texas', 1),
    (6, 'Enrolled in University or College', 2);

-- 5. TAG OPPORTUNITIES (So My Radar can match them to user profiles)
INSERT INTO opportunity_tags (opportunity_id, tag_id) VALUES
    -- Education Grant: student, under-30k, tuition-support
    (1, 3), (1, 4), (1, 7),
    -- TEXAS Grant: student, texas, under-30k, tuition-support
    (2, 3), (2, 5), (2, 4), (2, 7),
    -- Employment Benefit: part-time, full-time, entry-level
    (3, 1), (3, 2), (3, 6),
    -- Federal Work-Study: student, part-time, under-30k, tuition-support
    (4, 3), (4, 1), (4, 4), (4, 7),
    -- Financial Support: texas, under-30k
    (5, 5), (5, 4),
    -- Frost Bank Program: student, texas, tuition-support
    (6, 3), (6, 5), (6, 7);

-- 6. INSERT USER COMPARISON & SAVED QUEUE (Matches your initial status values)
INSERT INTO user_opportunities (user_id, opportunity_id, status) VALUES
    (1, 1, 'IN_COMPARISON'),
    (1, 2, 'IN_COMPARISON'),
    (1, 3, 'IN_COMPARISON'),
    (1, 4, 'IN_COMPARISON'),
    (1, 5, 'SAVED'),
    (1, 6, 'SAVED');

-- 7. INSERT ACTIVE PURSUITS & CHECKLIST STEPS (Matches your activePursuits state)
INSERT INTO user_pursuits (pursuit_id, user_id, opportunity_id) VALUES
    (1, 1, 1), -- Education Grant
    (2, 1, 3), -- Employment Benefit
    (3, 1, 5); -- Financial Support

INSERT INTO pursuit_steps (pursuit_id, label, is_checked, step_order) VALUES
    -- Pursuit 1: Education Grant
    (1, 'Check eligibility', TRUE, 1),
    (1, 'Gather documents', FALSE, 2),
    (1, 'Submit application', FALSE, 3),
    -- Pursuit 2: Employment Benefit
    (2, 'Verify employer status', TRUE, 1),
    (2, 'Submit application', TRUE, 2),
    (2, 'Receive confirmation', FALSE, 3),
    -- Pursuit 3: Financial Support
    (3, 'Check eligibility', FALSE, 1),
    (3, 'Upload tax forms', FALSE, 2),
    (3, 'Final review', FALSE, 3);
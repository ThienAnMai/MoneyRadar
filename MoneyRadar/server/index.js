import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// Helper: Sync user_tags whenever a user signs up or updates their profile
async function syncUserTags(conn, userId, profile) {
  await conn.query('DELETE FROM user_tags WHERE user_id = ?', [userId]);

  const rawValues = [
    profile.employment,
    profile.education,
    profile.income,
    profile.location,
    profile.experience,
    profile.goal,
  ].filter(Boolean);

  const normalizedTags = rawValues.map((v) =>
    v
      .toLowerCase()
      .replace(/\$30,000/g, '30k')
      .replace(/\$60,000\+/g, '60k-plus')
      .replace(/\$60,000/g, '60k')
      .replace(/'/g, '') // "Bachelor's" -> "bachelors"
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  );

  if (normalizedTags.length === 0) return;

  const [matchingTags] = await conn.query(
    'SELECT tag_id FROM tags WHERE name IN (?)',
    [normalizedTags]
  );

  if (matchingTags.length > 0) {
    const values = matchingTags.map((t) => [userId, t.tag_id]);
    await conn.query('INSERT IGNORE INTO user_tags (user_id, tag_id) VALUES ?', [values]);
  }
}

// Helper: Format opportunities with eligibility arrays
// Replace getFormattedOpportunities() in server/index.js:
async function getFormattedOpportunities(whereClause = 'WHERE o.is_active = TRUE', params = []) {
  const [opps] = await pool.query(`SELECT o.* FROM opportunities o ${whereClause}`, params);
  const [rules] = await pool.query('SELECT * FROM opportunity_eligibility ORDER BY sort_order ASC');
  const [oppTags] = await pool.query(
    `SELECT ot.opportunity_id, t.name
     FROM opportunity_tags ot
     JOIN tags t ON ot.tag_id = t.tag_id`
  );

  return opps.map((opp) => ({
    id: opp.opportunity_id,
    slug: opp.slug,
    title: opp.title,
    category: opp.category,
    type: opp.opportunity_type,
    value: opp.amount_display,
    deadline: opp.deadline_display,
    description: opp.description,
    eligibility: rules
      .filter((r) => r.opportunity_id === opp.opportunity_id)
      .map((r) => r.rule_text),
    tags: oppTags
      .filter((t) => t.opportunity_id === opp.opportunity_id)
      .map((t) => t.name),
  }));
}

// 1. AUTH: Sign Up
app.post('/api/auth/signup', async (req, res) => {
  const { fullName, email, password, employment, income, education } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await conn.query(
      `INSERT INTO users (full_name, email, password_hash, employment_status, income_range, education_level)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, email, passwordHash, employment, income, education]
    );
    const userId = result.insertId;
    const profile = {
      employment: employment || '',
      education: education || '',
      income: income || '',
      location: '',
      experience: '',
      goal: '',
    };
    await syncUserTags(conn, userId, profile);
    await conn.commit();

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: userId, fullName, email, profile } });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// 2. AUTH: Sign In
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    // Note: For the seeded demo user placeholder hash, allow 'password123' during testing
    const isDemoBypass = email === 'demo@moneyradar.app' && password === 'password123';
    if (!user || (!isDemoBypass && !(await bcrypt.compare(password, user.password_hash)))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.user_id,
        fullName: user.full_name,
        email: user.email,
        profile: {
          employment: user.employment_status || '',
          education: user.education_level || '',
          income: user.income_range || '',
          location: user.location || '',
          experience: user.experience_level || '',
          goal: user.current_goal || '',
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. OPPORTUNITIES: Explore Tab
app.get('/api/opportunities', async (req, res) => {
  try {
    const list = await getFormattedOpportunities();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. MY RADAR: Tag-Matched Recommendations
app.get('/api/users/:userId/recommendations', async (req, res) => {
  try {
    const [opps] = await pool.query(
      `SELECT o.*, COUNT(ot.tag_id) AS matched_tag_count
       FROM opportunities o
       JOIN opportunity_tags ot ON o.opportunity_id = ot.opportunity_id
       JOIN user_tags ut ON ot.tag_id = ut.tag_id
       WHERE ut.user_id = ? AND o.is_active = TRUE
       GROUP BY o.opportunity_id
       ORDER BY matched_tag_count DESC, o.deadline_date ASC`,
      [req.params.userId]
    );
    const [rules] = await pool.query('SELECT * FROM opportunity_eligibility ORDER BY sort_order ASC');

    const formatted = opps.map((opp) => ({
      id: opp.opportunity_id,
      slug: opp.slug,
      title: opp.title,
      category: opp.category,
      type: opp.opportunity_type,
      value: opp.amount_display,
      deadline: opp.deadline_display,
      description: opp.description,
      matchedTagCount: opp.matched_tag_count,
      eligibility: rules
        .filter((r) => r.opportunity_id === opp.opportunity_id)
        .map((r) => r.rule_text),
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. PROFILE: Update Questionnaire & Re-sync Tags
app.put('/api/users/:userId/profile', async (req, res) => {
  const { employment, education, income, location, experience, goal } = req.body;
  const userId = req.params.userId;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE users SET
        employment_status = ?, education_level = ?, income_range = ?,
        location = ?, experience_level = ?, current_goal = ?
       WHERE user_id = ?`,
      [employment, education, income, location, experience, goal, userId]
    );
    await syncUserTags(conn, userId, req.body);
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// 6. COMPARE & SAVED QUEUE
app.get('/api/users/:userId/comparisons', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT opportunity_id FROM user_opportunities WHERE user_id = ? AND status = 'IN_COMPARISON'",
      [req.params.userId]
    );
    res.json(rows.map((r) => r.opportunity_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/:userId/comparisons/:oppId', async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO user_opportunities (user_id, opportunity_id, status)
       VALUES (?, ?, 'IN_COMPARISON')
       ON DUPLICATE KEY UPDATE status = 'IN_COMPARISON'`,
      [req.params.userId, req.params.oppId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:userId/comparisons/:oppId', async (req, res) => {
  try {
    await pool.query(
      `UPDATE user_opportunities SET status = 'SAVED'
       WHERE user_id = ? AND opportunity_id = ?`,
      [req.params.userId, req.params.oppId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. ACTIVE PURSUITS & CHECKLIST STEPS
app.get('/api/users/:userId/pursuits', async (req, res) => {
  try {
    const [pursuits] = await pool.query(
      `SELECT up.pursuit_id, up.opportunity_id, o.title, o.category
       FROM user_pursuits up
       JOIN opportunities o ON up.opportunity_id = o.opportunity_id
       WHERE up.user_id = ?
       ORDER BY up.started_at ASC`,
      [req.params.userId]
    );
    const [steps] = await pool.query(
      `SELECT ps.* FROM pursuit_steps ps
       JOIN user_pursuits up ON ps.pursuit_id = up.pursuit_id
       WHERE up.user_id = ?
       ORDER BY ps.step_order ASC`,
      [req.params.userId]
    );

    const formatted = pursuits.map((p, idx) => ({
      id: p.pursuit_id,
      opportunityId: p.opportunity_id,
      title: p.title,
      category: p.category,
      expanded: idx === 0,
      steps: steps
        .filter((s) => s.pursuit_id === p.pursuit_id)
        .map((s) => ({
          id: s.step_id,
          label: s.label,
          checked: Boolean(s.is_checked),
        })),
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/:userId/pursuits', async (req, res) => {
  const { opportunityId, defaultSteps } = req.body;
  const userId = req.params.userId;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [existing] = await conn.query(
      'SELECT pursuit_id FROM user_pursuits WHERE user_id = ? AND opportunity_id = ?',
      [userId, opportunityId]
    );
    if (existing.length > 0) {
      await conn.commit();
      return res.json({ pursuitId: existing[0].pursuit_id, alreadyExists: true });
    }

    const [result] = await conn.query(
      'INSERT INTO user_pursuits (user_id, opportunity_id) VALUES (?, ?)',
      [userId, opportunityId]
    );
    const pursuitId = result.insertId;

    const stepValues = defaultSteps.map((label, i) => [pursuitId, label, false, i + 1]);
    await conn.query(
      'INSERT INTO pursuit_steps (pursuit_id, label, is_checked, step_order) VALUES ?',
      [stepValues]
    );

    const [createdSteps] = await conn.query(
      'SELECT step_id AS id, label, is_checked AS checked FROM pursuit_steps WHERE pursuit_id = ? ORDER BY step_order ASC',
      [pursuitId]
    );

    await conn.commit();
    res.json({
      pursuitId,
      alreadyExists: false,
      steps: createdSteps.map((s) => ({ ...s, checked: Boolean(s.checked) })),
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.patch('/api/pursuit-steps/:stepId', async (req, res) => {
  const { checked } = req.body;
  try {
    await pool.query('UPDATE pursuit_steps SET is_checked = ? WHERE step_id = ?', [
      checked,
      req.params.stepId,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 5000}`);
});
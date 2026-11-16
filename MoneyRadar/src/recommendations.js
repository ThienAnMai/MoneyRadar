// Rule-based matching for My Radar. Runs entirely in the browser, with no database.
//
// Each rule lists:
//   requires: every check must pass, or the opportunity is not recommended.
//   prefers:  optional checks that raise the ranking when they pass.
// Every passing check contributes a plain-language reason shown to the user.
// Matches are estimates only; the UI never claims the user qualifies.

export const PROFILE_OPTIONS = {
  employment: ['Part-time', 'Full-time', 'Freelance', 'Unemployed'],
  education: ['High school', 'College student', 'Graduate student', 'Not currently enrolled'],
  income: ['Under $30,000', '$30,000 - $60,000', '$60,000+'],
  location: ['Texas', 'California', 'Florida', 'New York', 'Other U.S. state', 'Outside the U.S.'],
  experience: ['Entry-level', 'Mid-level', 'Experienced'],
  goal: ['Tuition support', 'Career training', 'Reduce taxes', 'Student loan relief', 'General financial help'],
};

const isEnrolled = (p) => p.education === 'College student' || p.education === 'Graduate student';
const isEmployed = (p) => p.employment === 'Part-time' || p.employment === 'Full-time';
const livesInUS = (p) => p.location !== 'Outside the U.S.';
const lowerIncome = (p) => p.income === 'Under $30,000';
const underSixtyK = (p) => p.income === 'Under $30,000' || p.income === '$30,000 - $60,000';

const ENROLLED = { test: isEnrolled, reason: 'You are enrolled in college' };
const EMPLOYED = { test: isEmployed, reason: 'You are currently employed' };
const US_RESIDENT = { test: livesInUS, reason: 'You live in the U.S.' };
const IN_TEXAS = { test: (p) => p.location === 'Texas', reason: 'You live in Texas' };
const LOWER_INCOME = { test: lowerIncome, reason: 'Your income is under $30,000' };
const NEED_BASED_INCOME = { test: underSixtyK, reason: 'Your income fits need-based aid' };
const goal = (name, reason) => ({ test: (p) => p.goal === name, reason });

const MATCH_RULES = {
  'ed-grant': {
    requires: [ENROLLED],
    prefers: [LOWER_INCOME, goal('Tuition support', 'Your goal is tuition support')],
  },
  'texas-grant': {
    requires: [
      IN_TEXAS,
      { test: (p) => p.education === 'College student', reason: 'You are an undergraduate student' },
      NEED_BASED_INCOME,
    ],
    prefers: [goal('Tuition support', 'Your goal is tuition support')],
  },
  'esa-foundation': {
    requires: [
      US_RESIDENT,
      { test: (p) => p.education !== 'Not currently enrolled', reason: 'You are in school or heading to college' },
    ],
    prefers: [goal('Tuition support', 'Your goal is tuition support')],
  },
  'phcc-scholarship': {
    requires: [ENROLLED],
    prefers: [goal('Career training', 'Your goal is career training')],
  },
  'emp-benefit': {
    requires: [EMPLOYED],
    prefers: [goal('Career training', 'Your goal is career training')],
  },
  'federal-work-study': {
    requires: [ENROLLED, US_RESIDENT],
    prefers: [
      LOWER_INCOME,
      { test: (p) => p.employment !== 'Full-time', reason: 'Fits around a class schedule' },
    ],
  },
  'workforce-pell': {
    requires: [US_RESIDENT, NEED_BASED_INCOME],
    prefers: [goal('Career training', 'Your goal is career training')],
  },
  'amazon-career-choice': {
    requires: [EMPLOYED],
    prefers: [
      goal('Career training', 'Your goal is career training'),
      goal('Tuition support', 'Your goal is tuition support'),
    ],
  },
  'fin-support': {
    requires: [IN_TEXAS, LOWER_INCOME],
    prefers: [],
  },
  'frost-bank': {
    requires: [IN_TEXAS, ENROLLED],
    prefers: [goal('Tuition support', 'Your goal is tuition support')],
  },
  'utd-tuition-waiver': {
    requires: [
      { test: (p) => p.education === 'Graduate student', reason: 'You are a graduate student' },
      { test: (p) => p.location !== 'Texas', reason: 'You may qualify as a non-resident' },
    ],
    prefers: [goal('Tuition support', 'Your goal is tuition support')],
  },
  'student-loan-interest': {
    requires: [
      { test: (p) => p.education !== 'High school', reason: 'You may have student loans' },
      US_RESIDENT,
    ],
    prefers: [
      goal('Student loan relief', 'Your goal is student loan relief'),
      goal('Reduce taxes', 'Your goal is reducing taxes'),
    ],
  },
};

// Returns matching opportunities, best fit first, each with a `reasons` array.
// Opportunities without a rule are never recommended (they stay available in Explore).
export function getRecommendations(profile, opportunities) {
  return opportunities
    .map((opportunity, index) => {
      const rule = MATCH_RULES[opportunity.id];
      if (!rule || !rule.requires.every((check) => check.test(profile))) return null;
      const preferred = rule.prefers.filter((check) => check.test(profile));
      return {
        ...opportunity,
        reasons: [...rule.requires, ...preferred].map((check) => check.reason),
        score: rule.requires.length * 2 + preferred.length,
        index,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.index - b.index);
}

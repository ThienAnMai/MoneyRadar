import React, { useEffect, useRef, useState } from 'react';
import CategoryBadge from './components/CategoryBadge.jsx';
import Toast from './components/Toast.jsx';
import WelcomeGuide from './components/WelcomeGuide.jsx';
import { useToast } from './components/useToast.js';
import {
  ArrowRightIcon,
  BackIcon,
  CheckCircleIcon,
  CheckIcon,
  ChecklistIcon,
  ChevronDownIcon,
  CloseIcon,
  CompareIcon,
  ExploreIcon,
  HelpIcon,
  PlusIcon,
  RadarIcon,
  UserIcon,
} from './components/icons.jsx';

const TABS = [
  { id: 'explore', label: 'Explore', shortLabel: 'Explore', Icon: ExploreIcon },
  { id: 'radar', label: 'My Radar', shortLabel: 'My Radar', Icon: RadarIcon },
  { id: 'compare', label: 'Compare & Plan', shortLabel: 'Compare', Icon: CompareIcon },
  { id: 'active', label: 'Active Pursuits', shortLabel: 'Pursuits', Icon: ChecklistIcon },
];
const TAB_LABELS = Object.fromEntries(TABS.map((t) => [t.id, t.label]));
const MAX_TAB_HISTORY = 20;
const GUIDE_DISMISSED_KEY = 'moneyradar.guideDismissed';
const DEFAULT_PURSUIT_STEPS = ['Check eligibility', 'Gather documents', 'Submit application'];
const PROFILE_OPTIONS = {
  employment: ['Part-time', 'Full-time', 'Unemployed', 'Freelance'],
  education: ['Student', 'High School', "Bachelor's Degree", 'Graduate'],
  income: ['Under $30,000', '$30,000 - $60,000', '$60,000+'],
  location: ['Texas', 'California', 'New York', 'Florida', 'Other (US)'],
  experience: ['Entry-level', 'Mid-level', 'Senior-level'],
  goal: ['Tuition support', 'Emergency aid', 'Career training', 'Tax relief'],
};

function readGuideDismissed() {
  try {
    return localStorage.getItem(GUIDE_DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'signin', 'signup', 'dashboard'
  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'radar', 'compare', 'active'
  const [tabHistory, setTabHistory] = useState([]); // previously visited tabs, for the in-app Back button
  const [selectedOpportunity, setSelectedOpportunity] = useState(null); // Modal state for view details
  const [showGuide, setShowGuide] = useState(() => !readGuideDismissed());
  const { toast, showToast, dismissToast } = useToast();
  const modalCloseRef = useRef(null);
  const modalReturnFocusRef = useRef(null);

  // --- AUTH & USER SESSION STATE ---
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [signInForm, setSignInForm] = useState({ email: 'demo@moneyradar.app', password: 'password123' });
  const [signUpForm, setSignUpForm] = useState({
    fullName: '',
    email: '',
    password: '',
    employment: 'Part-time',
    income: 'Under $30,000',
    education: 'Student',
  });

  /* OLD HARDCODED PROFILE:
  const [profile, setProfile] = useState({
    employment: 'Part-time',
    education: 'Student',
    income: 'Under $30,000',
    location: 'Texas',
    experience: 'Entry-level',
    goal: 'Tuition support',
  });
  */
  const [profile, setProfile] = useState({
    employment: '',
    education: '',
    income: '',
    location: '',
    experience: '',
    goal: '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(profile); // questionnaire edits, applied on Save

  /* OLD HARDCODED ACTIVE PURSUITS:
  const [activePursuits, setActivePursuits] = useState([
    {
      id: '1',
      title: 'Education Grant',
      category: 'EDUCATION',
      steps: [
        { id: 's1', label: 'Check eligibility', checked: true },
        { id: 's2', label: 'Gather documents', checked: false },
        { id: 's3', label: 'Submit application', checked: false },
      ],
      expanded: true,
    },
    {
      id: '2',
      title: 'Employment Benefit',
      category: 'EMPLOYMENT',
      steps: [
        { id: 's1', label: 'Verify employer status', checked: true },
        { id: 's2', label: 'Submit application', checked: true },
        { id: 's3', label: 'Receive confirmation', checked: false },
      ],
      expanded: false,
    },
    {
      id: '3',
      title: 'Financial Support',
      category: 'OTHER',
      steps: [
        { id: 's1', label: 'Check eligibility', checked: false },
        { id: 's2', label: 'Upload tax forms', checked: false },
        { id: 's3', label: 'Final review', checked: false },
      ],
      expanded: false,
    },
  ]);
  */
  const [activePursuits, setActivePursuits] = useState([]);

  /* OLD HARDCODED OPPORTUNITIES LIST:
  const opportunitiesList = [
    {
      id: 'ed-grant',
      title: 'Education Grant',
      category: 'EDUCATION',
      value: 'Up to $1,000',
      deadline: '30 Nov 2026',
      description: 'Example support for course fees and study materials. Review the provider’s full terms.',
      eligibility: ['Enrolled in an eligible course', 'Income information required', 'Proof of enrolment required'],
      status: 'In comparison',
    },
    {
      id: 'ed-grant',
      title: 'Toward Excellence, Access & Success (TEXAS) Grant Program',
      category: 'EDUCATION',
      value: 'Up to $5,429 per semester or over $16,000 across an academic year depending on state allocations',
      deadline: 'January 15 2027',
      description: 'State-funded, need-based financial aid program established by the Texas Legislature to help eligible students with financial need attend public universities and health-related institutions in Texas.',
      eligibility: ['Enrolled in 3/4 time', 'Income information required', 'Proof of enrollment in first undergraduate degree required'],
      status: 'In comparison',
    },
    {
      id: 'emp-benefit',
      title: 'Employment Benefit',
      category: 'EMPLOYMENT',
      value: 'Up to $500',
      deadline: '15 Dec 2026',
      description: 'Work-related training costs and professional certification subsidies.',
      eligibility: ['Part-time or full-time employment status', 'Employer approval letter'],
      status: 'In comparison',
    },
    {
      id: 'emp-benefit',
      title: 'Federal Work-Study (FWS) program',
      category: 'EMPLOYMENT',
      value: 'Depends on FAFSA application',
      deadline: 'June 30 2027',
      description: 'Part-time jobs tailored to a students class schedule, with earnings that can be structured around financial need.',
      eligibility: ['FAFSA application', 'Enrolled in University, College, or Trade School'],
      status: 'In comparison',
    },
    {
      id: 'fin-support',
      title: 'Financial Support',
      category: 'OTHER',
      value: 'Up to $750',
      deadline: '31 Dec 2026',
      description: 'Direct state tax return support for residents meeting income criteria.',
      eligibility: ['Resident in Texas', 'Income under $30,000'],
      status: 'Saved for later',
    },
      {
      id: 'fin-support',
      title: 'Frost Bank Program',
      category: 'OTHER',
      value: '$8000 interest free loan',
      deadline: 'Until funds are exhausted',
      description: 'Ernest A. Mantzel Foundation is offering an interest free loan to undergraduates and graduates enrolled full-time at any Texas College or University',
      eligibility: ['Resident in Texas', 'Enrolled in University or College'],
      status: 'Saved for later',
    },
  ];
  */
  const [opportunitiesList, setOpportunitiesList] = useState([]);
  const [recommendedOpportunities, setRecommendedOpportunities] = useState([]);

  /* OLD HARDCODED COMPARE IDS:
  const [compareIds, setCompareIds] = useState(() =>
    opportunitiesList.filter((o) => o.status === 'In comparison').map((o) => o.id)
  );
  */
  const [compareIds, setCompareIds] = useState([]);
  const comparedOpportunities = opportunitiesList.filter((o) => compareIds.includes(o.id));
  // --- EXPLORE SEARCH & CATEGORY FILTER ---
  const [exploreSearch, setExploreSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const availableCategories = ['ALL', ...new Set(opportunitiesList.map((o) => o.category))];

  const filteredOpportunities = opportunitiesList.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    const query = exploreSearch.trim().toLowerCase();
    if (!query) return matchesCategory;

    const inTitle = item.title?.toLowerCase().includes(query);
    const inValue = item.value?.toLowerCase().includes(query);
    const inCategory = item.category?.toLowerCase().includes(query);
    const inTags = Array.isArray(item.tags) && item.tags.some((tag) => tag.toLowerCase().includes(query));

    return matchesCategory && (inTitle || inValue || inCategory || inTags);
  });
  // --- FETCH INITIAL DATA FROM API ---
  const loadUserDashboardData = async (userId) => {
    try {
      const [oppsRes, recsRes, compRes, pursuitsRes] = await Promise.all([
        fetch('/api/opportunities'),
        fetch(`/api/users/${userId}/recommendations`),
        fetch(`/api/users/${userId}/comparisons`),
        fetch(`/api/users/${userId}/pursuits`),
      ]);

      if (oppsRes.ok) setOpportunitiesList(await oppsRes.json());
      if (recsRes.ok) setRecommendedOpportunities(await recsRes.json());
      if (compRes.ok) setCompareIds(await compRes.json());
      if (pursuitsRes.ok) setActivePursuits(await pursuitsRes.json());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      showToast('Failed to load data from server.', 'error');
    }
  };

  // Load public opportunities on mount so Explore has data ready
  useEffect(() => {
    fetch('/api/opportunities')
      .then((res) => res.json())
      .then((data) => setOpportunitiesList(data))
      .catch((err) => console.error('Error fetching opportunities:', err));
  }, []);

  // --- AUTH HANDLERS ---
  const handleSignIn = async (e) => {
    e?.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signInForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Sign in failed');
        return;
      }
      localStorage.setItem('moneyradar.token', data.token);
      setCurrentUser(data.user);
      setProfile(data.user.profile);
      await loadUserDashboardData(data.user.id);
      setCurrentView('dashboard');
    } catch {
      setAuthError('Could not connect to server.');
    }
  };

  const handleSignUp = async (e) => {
    e?.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Sign up failed');
        return;
      }
      localStorage.setItem('moneyradar.token', data.token);
      setCurrentUser(data.user);
      setProfile(data.user.profile);
      await loadUserDashboardData(data.user.id);
      setCurrentView('dashboard');
    } catch {
      setAuthError('Could not connect to server.');
    }
  };

  const toggleStep = async (pursuitId, stepId, nextChecked) => {
    // Optimistic UI update
    setActivePursuits((prev) =>
      prev.map((p) => {
        if (p.id !== pursuitId) return p;
        const updatedSteps = p.steps.map((s) => (s.id === stepId ? { ...s, checked: nextChecked } : s));
        return { ...p, steps: updatedSteps };
      })
    );

    try {
      await fetch(`/api/pursuit-steps/${stepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked: nextChecked }),
      });
    } catch (err) {
      console.error('Failed to update step:', err);
      showToast('Failed to save step status to database.', 'error');
    }
  };

  const toggleExpand = (pursuitId) => {
    setActivePursuits((prev) =>
      prev.map((p) => (p.id === pursuitId ? { ...p, expanded: !p.expanded } : p))
    );
  };

  // --- NAVIGATION, FEEDBACK & GUIDANCE ---
  const navigateTo = (tab) => {
    if (tab === activeTab) return;
    setTabHistory((prev) => [...prev, activeTab].slice(-MAX_TAB_HISTORY));
    setActiveTab(tab);
    window.scrollTo({ top: 0 });
  };

  const goBack = () => {
    if (tabHistory.length === 0) return;
    setActiveTab(tabHistory[tabHistory.length - 1]);
    setTabHistory((prev) => prev.slice(0, -1));
    window.scrollTo({ top: 0 });
  };

  const signOut = () => {
    localStorage.removeItem('moneyradar.token');
    setCurrentUser(null);
    setSelectedOpportunity(null);
    setIsEditingProfile(false);
    setTabHistory([]);
    setActiveTab('explore');
    setCurrentView('landing');
  };

  const dismissGuide = () => {
    setShowGuide(false);
    try {
      localStorage.setItem(GUIDE_DISMISSED_KEY, '1');
    } catch {
      // Storage unavailable (e.g. private mode); the guide just reappears next visit.
    }
  };

  const addToComparison = async (item) => {
    setSelectedOpportunity(null);
    if (compareIds.includes(item.id)) {
      showToast(`${item.title} is already in your comparison.`, 'info');
    } else {
      setCompareIds((prev) => [...prev, item.id]);
      showToast(`Added ${item.title} to your comparison.`);
      if (currentUser) {
        await fetch(`/api/users/${currentUser.id}/comparisons/${item.id}`, { method: 'POST' });
      }
    }
    navigateTo('compare');
  };

  const removeFromComparison = async (item) => {
    setCompareIds((prev) => prev.filter((id) => id !== item.id));
    showToast(`Removed ${item.title} from your comparison.`);
    if (currentUser) {
      await fetch(`/api/users/${currentUser.id}/comparisons/${item.id}`, { method: 'DELETE' });
    }
  };

  const pursueOpportunity = async (item) => {
    /* OLD LOCAL-ONLY PURSUE LOGIC:
    const existing = activePursuits.find((p) => p.title === item.title);
    if (existing) {
      setActivePursuits((prev) => prev.map((p) => (p.id === existing.id ? { ...p, expanded: true } : p)));
      showToast(`${item.title} is already in Active Pursuits. Its checklist is open below.`, 'info');
    } else {
      setActivePursuits((prev) => [
        ...prev,
        {
          id: item.id,
          title: item.title,
          category: item.category,
          steps: DEFAULT_PURSUIT_STEPS.map((label, i) => ({ id: `s${i + 1}`, label, checked: false })),
          expanded: true,
        },
      ]);
      showToast(`Added ${item.title} to Active Pursuits.`);
    }
    navigateTo('active');
    */

    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}/pursuits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId: item.id, defaultSteps: DEFAULT_PURSUIT_STEPS }),
      });
      const data = await res.json();

      if (data.alreadyExists) {
        setActivePursuits((prev) =>
          prev.map((p) => (p.id === data.pursuitId ? { ...p, expanded: true } : p))
        );
        showToast(`${item.title} is already in Active Pursuits. Its checklist is open below.`, 'info');
      } else {
        setActivePursuits((prev) => [
          ...prev,
          {
            id: data.pursuitId,
            opportunityId: item.id,
            title: item.title,
            category: item.category,
            steps: data.steps,
            expanded: true,
          },
        ]);
        showToast(`Added ${item.title} to Active Pursuits.`);
      }
      navigateTo('active');
    } catch (err) {
      console.error('Failed to add pursuit:', err);
      showToast('Could not add pursuit to database.', 'error');
    }
  };

  const handleStepToggle = (pursuit, step) => {
    const nextChecked = !step.checked;
    toggleStep(pursuit.id, step.id, nextChecked);
    const doneCount = pursuit.steps.filter((s) => (s.id === step.id ? nextChecked : s.checked)).length;
    const total = pursuit.steps.length;
    if (nextChecked && doneCount === total) {
      showToast(`All ${total} steps complete for ${pursuit.title}.`);
    } else if (nextChecked) {
      showToast(`Marked "${step.label}" as done. ${doneCount} of ${total} steps complete.`);
    } else {
      showToast(`Marked "${step.label}" as not done. ${doneCount} of ${total} steps complete.`, 'info');
    }
  };

  const openProfileEditor = () => {
    setProfileDraft(profile);
    setIsEditingProfile(true);
  };

  const cancelProfileEdit = () => {
    setProfileDraft(profile);
    setIsEditingProfile(false);
  };

  const saveProfile = async () => {
    const changed = Object.keys(profile).some((key) => profile[key] !== profileDraft[key]);
    setIsEditingProfile(false);
    if (!changed) {
      showToast('No changes to save. Your profile is unchanged.', 'info');
      return;
    }

    setProfile(profileDraft);
    if (currentUser) {
      try {
        await fetch(`/api/users/${currentUser.id}/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileDraft),
        });
        // Re-fetch tag-matched recommendations after updating profile tags
        const recsRes = await fetch(`/api/users/${currentUser.id}/recommendations`);
        if (recsRes.ok) setRecommendedOpportunities(await recsRes.json());
        showToast('Profile saved and tags updated. New recommendations loaded!');
      } catch (err) {
        console.error('Failed to update profile:', err);
        showToast('Failed to save profile to database.', 'error');
      }
    }
  };

  const refreshRecommendations = async () => {
    if (!currentUser) return;
    const recsRes = await fetch(`/api/users/${currentUser.id}/recommendations`);
    if (recsRes.ok) {
      const data = await recsRes.json();
      setRecommendedOpportunities(data);
      showToast(`Scan complete. Showing ${data.length} recommendations matched to your profile tags.`);
    }
  };

  // Details modal: focus the close button on open, close on Escape, and return
  // focus to the element that opened it.
  useEffect(() => {
    if (!selectedOpportunity) return undefined;
    modalReturnFocusRef.current = document.activeElement;
    modalCloseRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedOpportunity(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      modalReturnFocusRef.current?.focus?.();
    };
  }, [selectedOpportunity]);

  // --- LANDING PAGE ---
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-white text-stone-900 flex flex-col font-sans">
        <header className="w-full border-b border-stone-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/MoneyRadarLogo.png" alt="MoneyRadar Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-tight">Money Radar</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => { setAuthError(''); setCurrentView('signin'); }} className="text-sm font-medium text-stone-600 hover:text-stone-900 px-4 py-2">
              Sign In
            </button>
            <button onClick={() => { setAuthError(''); setCurrentView('signup'); }} className="bg-[#4b583f] hover:bg-[#3d4833] text-white text-sm font-medium px-5 py-2 rounded-lg transition">
              Get Started
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-left space-y-6">
            <div className="inline-block bg-[#f4f6f0] text-[#4b583f] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Smart Financial Discovery
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 leading-tight">
              Find financial opportunities tailored for you.
            </h1>
            <p className="text-lg text-stone-600">
              Discover grants, tax credits, employment benefits, and more — curated specifically using your profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={() => { setAuthError(''); setCurrentView('signup'); }} className="bg-[#4b583f] hover:bg-[#3d4833] text-white font-medium py-3 px-8 rounded-xl shadow-md transition text-center">
                Get Started
              </button>
              <button onClick={() => { setAuthError(''); setCurrentView('signin'); }} className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium py-3 px-8 rounded-xl transition text-center">
                Sign In
              </button>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-72 h-72 md:w-96 md:h-96 bg-[#f4f6f0] rounded-3xl border-2 border-[#4b583f]/20 flex items-center justify-center shadow-lg relative">
              <img src="/MoneyRadarLogo.png" alt="MoneyRadar Logo" className="w-48 h-48 md:w-64 md:h-64 object-contain animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- SIGN IN PAGE ---
  if (currentView === 'signin') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center items-center gap-2 mb-4">
            <img src="/MoneyRadarLogo.png" alt="MoneyRadar Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-tight">Money Radar</span>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-stone-900">Sign In</h2>
          <p className="mt-2 text-center text-sm text-stone-600">Welcome back. Log in to your account.</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <form onSubmit={handleSignIn} className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-stone-200 sm:px-10 space-y-6">
            {authError && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">{authError}</p>}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Email</label>
              <input
                type="email"
                required
                value={signInForm.email}
                onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={signInForm.password}
                onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
              />
              <div className="text-right mt-1">
                <a href="#" className="text-xs text-[#4b583f] hover:underline">Forgot password?</a>
              </div>
            </div>

            {/* OLD BUTTON: <button onClick={() => setCurrentView('dashboard')} ...> */}
            <button type="submit" className="w-full bg-[#4b583f] hover:bg-[#3d4833] text-white font-medium py-2.5 rounded-lg transition">
              Sign In
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink mx-4 text-xs text-stone-400 uppercase">or</span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSignInForm({ email: 'demo@moneyradar.app', password: 'password123' });
                handleSignIn();
              }}
              className="w-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm"
            >
              Continue with Demo Account
            </button>

            <p className="text-center text-sm text-stone-600 mt-4">
              Don't have an account?{' '}
              <button type="button" onClick={() => { setAuthError(''); setCurrentView('signup'); }} className="text-[#4b583f] font-semibold hover:underline">Sign Up</button>
            </p>
            <div className="text-center mt-2">
              <button type="button" onClick={() => setCurrentView('landing')} className="text-xs text-stone-500 hover:underline">← Back to home</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- SIGN UP PAGE ---
  if (currentView === 'signup') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center items-center gap-2 mb-4">
            <img src="/MoneyRadarLogo.png" alt="MoneyRadar Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-tight">Money Radar</span>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-stone-900">Sign Up</h2>
          <p className="mt-2 text-center text-sm text-stone-600">Create an account to find opportunities.</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <form onSubmit={handleSignUp} className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-stone-200 sm:px-10 space-y-4">
            {authError && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">{authError}</p>}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={signUpForm.fullName}
                onChange={(e) => setSignUpForm({ ...signUpForm, fullName: e.target.value })}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                value={signUpForm.email}
                onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={signUpForm.password}
                onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                placeholder="Create a password"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
              />
            </div>
            <p className="text-xs text-stone-500">We'll use your profile to match you with relevant financial opportunities.</p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Employment Status</label>
              <select
                value={signUpForm.employment}
                onChange={(e) => setSignUpForm({ ...signUpForm, employment: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
              >
                <option>Part-time</option>
                <option>Full-time</option>
                <option>Unemployed</option>
                <option>Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Income Range</label>
              <select
                value={signUpForm.income}
                onChange={(e) => setSignUpForm({ ...signUpForm, income: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
              >
                <option>Under $30,000</option>
                <option>$30,000 - $60,000</option>
                <option>$60,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Education Level</label>
              <select
                value={signUpForm.education}
                onChange={(e) => setSignUpForm({ ...signUpForm, education: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
              >
                <option>Student</option>
                <option>High School</option>
                <option>Bachelor's Degree</option>
                <option>Graduate</option>
              </select>
            </div>

            {/* OLD BUTTON: <button onClick={() => setCurrentView('dashboard')} ...> */}
            <button type="submit" className="w-full bg-[#4b583f] hover:bg-[#3d4833] text-white font-medium py-2.5 rounded-lg transition mt-4">
              Create Account
            </button>

            <p className="text-center text-sm text-stone-600 mt-4">
              Already have an account?{' '}
              <button type="button" onClick={() => { setAuthError(''); setCurrentView('signin'); }} className="text-[#4b583f] font-semibold hover:underline">Log in →</button>
            </p>
            <div className="text-center mt-2">
              <button type="button" onClick={() => setCurrentView('landing')} className="text-xs text-stone-500 hover:underline">← Back to home</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN WEB APP DASHBOARD ---
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans relative">
      {/* Top Header & Navigation Bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8 min-w-0">
            <button
              type="button"
              onClick={() => navigateTo('explore')}
              aria-label="Money Radar home (Explore)"
              className="flex items-center gap-2 rounded-lg"
            >
              <img src="/MoneyRadarLogo.png" alt="" className="w-8 h-8 object-contain" />
              <span className="text-lg font-bold tracking-tight">Money Radar</span>
            </button>

            <nav aria-label="Main" className="hidden md:flex items-center gap-1">
              {TABS.map(({ id, label, Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => navigateTo(id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-[#f4f6f0] text-[#4b583f] font-semibold after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:bg-[#4b583f]' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!showGuide && (
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 px-2.5 py-2 rounded-lg"
              >
                <HelpIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Guide</span>
                <span className="sr-only sm:hidden">Show guide</span>
              </button>
            )}
            <button type="button" onClick={signOut} className="text-sm font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 px-2.5 py-2 rounded-lg">
              Sign Out
            </button>
            <button
              type="button"
              onClick={() => navigateTo('radar')}
              aria-label="Your profile (My Radar)"
              title="Your profile"
              className="w-9 h-9 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-700 border border-stone-300"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Main"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200 grid grid-cols-4 pb-[env(safe-area-inset-bottom)]"
      >
        {TABS.map(({ id, shortLabel, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => navigateTo(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium active:bg-stone-100 ${isActive ? 'text-[#4b583f] font-bold' : 'text-stone-500'}`}
            >
              {isActive && <span className="absolute top-0 inset-x-4 h-0.5 rounded-full bg-[#4b583f]" aria-hidden="true" />}
              <span className={`px-3 py-0.5 rounded-full ${isActive ? 'bg-[#f4f6f0]' : ''}`}>
                <Icon className="w-5 h-5" />
              </span>
              {shortLabel}
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 pb-28 md:py-8 space-y-6">
        {tabHistory.length > 0 && (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#4b583f] hover:bg-[#f4f6f0] active:bg-[#e9eee2] -ml-2 px-2 py-1.5 rounded-lg"
          >
            <BackIcon className="w-4 h-4" />
            Back to {TAB_LABELS[tabHistory[tabHistory.length - 1]]}
          </button>
        )}

        {showGuide && <WelcomeGuide activeTab={activeTab} onNavigate={navigateTo} onDismiss={dismissGuide} />}

        {/* TAB 1: EXPLORE */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-stone-900">Explore Opportunities</h1>
              <p className="text-stone-600 text-sm mt-1">Browse available grants, tax credits, and financial benefits.</p>
            </div>

            {/* Search Bar & Category Filter Buttons */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={exploreSearch}
                  onChange={(e) => setExploreSearch(e.target.value)}
                  placeholder="Search by name, value, tag (e.g. texas, student), or category..."
                  aria-label="Search opportunities"
                  className="w-full px-4 py-3 pr-10 bg-white border border-stone-300 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
                />
                {exploreSearch && (
                  <button
                    type="button"
                    onClick={() => setExploreSearch('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Trigger Buttons */}
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
                {availableCategories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const label = cat === 'ALL' ? 'All Categories' : cat.charAt(0) + cat.slice(1).toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      aria-pressed={isSelected}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition border ${
                        isSelected
                          ? 'bg-[#4b583f] text-white border-[#4b583f] shadow-sm'
                          : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Grid */}
            {filteredOpportunities.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-stone-300 text-center space-y-3">
                <p className="text-sm text-stone-600">No opportunities match your search or selected category.</p>
                <button
                  type="button"
                  onClick={() => {
                    setExploreSearch('');
                    setSelectedCategory('ALL');
                  }}
                  className="text-sm font-semibold text-[#4b583f] hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredOpportunities.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedOpportunity(item)}
                    aria-label={`View details: ${item.title}`}
                    className="group text-left bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-[#4b583f]/60 active:bg-stone-50 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <CategoryBadge category={item.category} />
                        {compareIds.includes(item.id) && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                            <CheckIcon className="w-3.5 h-3.5" /> In comparison
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 mt-3">{item.title}</h3>
                      <p className="text-sm font-semibold text-stone-800 mt-1">{item.value}</p>
                      <p className="text-sm text-stone-600 mt-1">{item.description}</p>
                      {Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#4b583f] group-hover:underline">
                      View details
                      <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY RADAR */}
        {activeTab === 'radar' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <h1 className="text-3xl font-extrabold text-stone-900">My Radar</h1>
                <p className="text-stone-600 text-sm mt-1">Opportunities matched to your profile tags.</p>
              </div>
              <button
                type="button"
                onClick={isEditingProfile ? cancelProfileEdit : openProfileEditor}
                aria-expanded={isEditingProfile}
                aria-controls="profile-questionnaire"
                className="self-start sm:self-auto bg-stone-100 hover:bg-stone-200 active:bg-stone-300 border border-stone-200 text-stone-800 text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                {isEditingProfile ? 'Close Questionnaire' : 'Edit Profile Questionnaire'}
              </button>
            </div>

            {/* Profile Overview */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-stone-900 text-base">Your Profile</h3>
                <span className="text-xs text-[#4b583f] font-semibold bg-[#f4f6f0] px-2.5 py-1 rounded-full">Active Scanner</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-stone-700">
                <div><span className="text-stone-400 block text-xs">Employment</span> {profile.employment || '—'}</div>
                <div><span className="text-stone-400 block text-xs">Education</span> {profile.education || '—'}</div>
                <div><span className="text-stone-400 block text-xs">Income</span> {profile.income || '—'}</div>
                <div><span className="text-stone-400 block text-xs">Location</span> {profile.location || '—'}</div>
                <div><span className="text-stone-400 block text-xs">Experience</span> {profile.experience || '—'}</div>
                <div><span className="text-stone-400 block text-xs">Current Goal</span> {profile.goal || '—'}</div>
              </div>
            </div>

{/* Questionnaire panel */}
            {isEditingProfile && (
              <div id="profile-questionnaire" className="bg-[#f4f6f0] p-6 rounded-2xl border border-[#4b583f]/30 space-y-4">
                <h3 className="font-bold text-[#4b583f] text-lg">Update Profile Questionnaire</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="profile-employment" className="block text-xs font-semibold text-stone-700 mb-1">Employment</label>
                    <select
                      id="profile-employment"
                      value={profileDraft.employment}
                      onChange={(e) => setProfileDraft({ ...profileDraft, employment: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
                    >
                      <option value="">Select employment status...</option>
                      {PROFILE_OPTIONS.employment.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="profile-education" className="block text-xs font-semibold text-stone-700 mb-1">Education</label>
                    <select
                      id="profile-education"
                      value={profileDraft.education}
                      onChange={(e) => setProfileDraft({ ...profileDraft, education: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
                    >
                      <option value="">Select education level...</option>
                      {PROFILE_OPTIONS.education.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="profile-income" className="block text-xs font-semibold text-stone-700 mb-1">Income</label>
                    <select
                      id="profile-income"
                      value={profileDraft.income}
                      onChange={(e) => setProfileDraft({ ...profileDraft, income: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
                    >
                      <option value="">Select income range...</option>
                      {PROFILE_OPTIONS.income.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="profile-location" className="block text-xs font-semibold text-stone-700 mb-1">Location</label>
                    <select
                      id="profile-location"
                      value={profileDraft.location}
                      onChange={(e) => setProfileDraft({ ...profileDraft, location: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
                    >
                      <option value="">Select location...</option>
                      {PROFILE_OPTIONS.location.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="profile-experience" className="block text-xs font-semibold text-stone-700 mb-1">Experience</label>
                    <select
                      id="profile-experience"
                      value={profileDraft.experience}
                      onChange={(e) => setProfileDraft({ ...profileDraft, experience: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
                    >
                      <option value="">Select experience level...</option>
                      {PROFILE_OPTIONS.experience.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="profile-goal" className="block text-xs font-semibold text-stone-700 mb-1">Goal</label>
                    <select
                      id="profile-goal"
                      value={profileDraft.goal}
                      onChange={(e) => setProfileDraft({ ...profileDraft, goal: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b583f]"
                    >
                      <option value="">Select current goal...</option>
                      {PROFILE_OPTIONS.goal.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={saveProfile}
                    className="bg-[#4b583f] hover:bg-[#3d4833] active:bg-[#323b2a] text-white text-sm font-medium px-6 py-2.5 rounded-lg transition"
                  >
                    Save and Scan
                  </button>
                  <button
                    type="button"
                    onClick={cancelProfileEdit}
                    className="text-sm font-medium text-stone-700 hover:bg-white/70 active:bg-white px-4 py-2.5 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Recommendations (Tag-Matched from API) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                {/* OLD: <h3 className="font-bold text-stone-900 text-lg">New Recommendations ({opportunitiesList.length})</h3> */}
                <h3 className="font-bold text-stone-900 text-lg">New Recommendations ({recommendedOpportunities.length})</h3>
                <button
                  type="button"
                  onClick={refreshRecommendations}
                  className="text-xs text-[#4b583f] font-semibold hover:underline hover:bg-[#f4f6f0] px-2 py-1 rounded-md"
                >
                  Scan again
                </button>
              </div>

              {/* OLD: {opportunitiesList.map((item) => ( */}
              {recommendedOpportunities.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedOpportunity(item)}
                  aria-label={`View details: ${item.title}`}
                  className="group w-full text-left bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-[#4b583f]/60 active:bg-stone-50 transition flex justify-between items-center gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={item.category} />
                      {item.matchedTagCount && (
                        <span className="text-[11px] font-semibold text-[#4b583f] bg-[#f4f6f0] px-2 py-0.5 rounded-full">
                          {item.matchedTagCount} tag match{item.matchedTagCount > 1 ? 'es' : ''}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-stone-900 mt-2">{item.title}</h4>
                    <p className="text-xs text-stone-500">Based on your {item.category.toLowerCase()} profile</p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-[#4b583f] group-hover:underline">
                    <span className="hidden sm:inline">View details</span>
                    <span className="sm:hidden">Details</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COMPARE & PLAN */}
        {activeTab === 'compare' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-extrabold text-stone-900">Compare</h1>
              <p className="text-stone-600 text-sm mt-1">Compare opportunities and choose what to pursue.</p>
            </div>

            {/* Compare Side by Side section */}
            <div className="space-y-4">
              <h3 className="font-bold text-stone-900 text-lg">
                Compare side by side <span className="text-stone-500 font-medium">({comparedOpportunities.length})</span>
              </h3>
              {comparedOpportunities.length === 0 ? (
                <div className="bg-white p-6 rounded-2xl border border-dashed border-stone-300 text-center space-y-3">
                  <p className="text-sm text-stone-600">Nothing to compare yet. Add opportunities from the saved queue below, or browse Explore.</p>
                  <button
                    type="button"
                    onClick={() => navigateTo('explore')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4b583f] hover:bg-[#f4f6f0] px-3 py-2 rounded-lg"
                  >
                    Browse Explore
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {comparedOpportunities.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-2xl border-2 border-[#4b583f]/40 shadow-sm space-y-4 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <CategoryBadge category={item.category} />
                          <h4 className="font-bold text-stone-900 text-xl">{item.title}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromComparison(item)}
                          aria-label={`Remove ${item.title} from comparison`}
                          className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 px-2 py-1 rounded-md"
                        >
                          <CloseIcon className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                      <div className="text-sm space-y-1 text-stone-600 border-t border-b border-stone-100 py-3">
                        <p className="text-xs text-stone-400 uppercase font-semibold">Value</p>
                        <p className="text-stone-900 font-bold text-lg">{item.value}</p>
                        <p className="text-xs text-stone-400 uppercase font-semibold mt-2">Deadline</p>
                        <p className="text-stone-900 font-medium">{item.deadline}</p>
                      </div>
                      <p className="text-xs text-stone-600 flex-1">{item.description}</p>
                      <button
                        type="button"
                        onClick={() => pursueOpportunity(item)}
                        className="w-full bg-[#4b583f] hover:bg-[#3d4833] active:bg-[#323b2a] text-white py-2.5 rounded-lg font-medium text-sm transition"
                      >
                        Pursue
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Queue */}
            <div className="space-y-4">
              <h3 className="font-bold text-stone-900 text-lg">Saved queue ({opportunitiesList.length})</h3>
              <div className="space-y-3">
                {opportunitiesList.map((item) => {
                  const isCompared = compareIds.includes(item.id);
                  return (
                    <div key={item.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div>
                        <h4 className="font-bold text-stone-900">{item.title}</h4>
                        <p className="text-xs text-stone-500 mt-0.5">{isCompared ? 'In comparison' : 'Saved for later'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => (isCompared ? removeFromComparison(item) : addToComparison(item))}
                          aria-label={isCompared ? `Comparing ${item.title}. Remove from comparison` : `Add ${item.title} to comparison`}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition ${isCompared ? 'bg-[#f4f6f0] border-[#4b583f]/40 text-[#4b583f] hover:bg-[#e9eee2]' : 'border-stone-300 text-stone-700 hover:bg-stone-100 active:bg-stone-200'}`}
                        >
                          {isCompared ? <CheckIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                          {isCompared ? 'Comparing' : 'Compare'}
                        </button>
                        <button
                          type="button"
                          onClick={() => pursueOpportunity(item)}
                          className="border border-[#4b583f] text-[#4b583f] hover:bg-[#4b583f] hover:text-white active:bg-[#3d4833] px-5 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Pursue
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACTIVE PURSUITS */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-stone-900">Active Pursuits</h1>
              <p className="text-stone-600 text-sm mt-1">Track your next steps for each opportunity.</p>
            </div>

            <div className="space-y-4">
              {activePursuits.map((pursuit) => {
                const completedCount = pursuit.steps.filter((s) => s.checked).length;
                const progressPercent = (completedCount / pursuit.steps.length) * 100;
                const nextStep = pursuit.steps.find((s) => !s.checked);
                const isComplete = completedCount === pursuit.steps.length;
                const statusLabel = isComplete ? 'Complete' : completedCount === 0 ? 'Not started' : 'In progress';
                const panelId = `pursuit-steps-${pursuit.id}`;

                return (
                  <div
                    key={pursuit.id}
                    className={`bg-white p-6 rounded-2xl border shadow-sm space-y-4 ${pursuit.expanded ? 'border-[#4b583f]/40' : 'border-stone-200'}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(pursuit.id)}
                      aria-expanded={pursuit.expanded}
                      aria-controls={panelId}
                      className="group w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-left -mx-2 px-2 py-1 rounded-xl hover:bg-stone-50"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <CategoryBadge category={pursuit.category} />
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${isComplete ? 'bg-[#4b583f] text-white border-[#4b583f]' : completedCount === 0 ? 'bg-white text-stone-600 border-stone-300' : 'bg-[#f4f6f0] text-[#4b583f] border-[#4b583f]/30'}`}
                          >
                            {isComplete && <CheckIcon className="w-3 h-3" />}
                            {statusLabel}
                          </span>
                        </div>
                        <h3 className="font-bold text-stone-900 text-lg mt-1">{pursuit.title}</h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {nextStep ? (
                            <>
                              Next step: <span className="font-semibold text-stone-700">{nextStep.label}</span>
                            </>
                          ) : (
                            'All steps done. Nice work!'
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-stone-600 font-medium">
                          {completedCount} of {pursuit.steps.length} steps done
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4b583f] bg-[#f4f6f0] group-hover:bg-[#e9eee2] px-2.5 py-1.5 rounded-lg">
                          {pursuit.expanded ? 'Hide steps' : 'Show steps'}
                          <ChevronDownIcon className={`w-4 h-4 transition-transform ${pursuit.expanded ? 'rotate-180' : ''}`} />
                        </span>
                      </div>
                    </button>

                    <div
                      role="progressbar"
                      aria-label={`${pursuit.title} progress`}
                      aria-valuemin={0}
                      aria-valuemax={pursuit.steps.length}
                      aria-valuenow={completedCount}
                      aria-valuetext={`${completedCount} of ${pursuit.steps.length} steps done`}
                      className="w-full bg-stone-100 h-2 rounded-full overflow-hidden"
                    >
                      <div className="bg-[#4b583f] h-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                    </div>

                    {pursuit.expanded && (
                      <div id={panelId} className="space-y-1 pt-2 border-t border-stone-100">
                        <p className="text-xs text-stone-500 px-2 pb-1">Check off each step as you finish it. Your progress bar updates automatically.</p>
                        {pursuit.steps.map((step, index) => (
                          <label key={step.id} className="flex items-center gap-3 py-2 px-2 hover:bg-stone-50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={step.checked}
                              onChange={() => handleStepToggle(pursuit, step)}
                              className="w-4 h-4 shrink-0 accent-[#4b583f]"
                            />
                            <span className={`text-sm flex-1 ${step.checked ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                              <span className="sr-only">Step {index + 1}: </span>
                              {step.label}
                            </span>
                            {step.checked && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4b583f]">
                                <CheckCircleIcon className="w-3.5 h-3.5" /> Done
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* VIEW DETAILS POP-UP MODAL */}
      {selectedOpportunity && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOpportunity(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="opportunity-modal-title"
            className="bg-white max-w-lg w-full max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl p-6 shadow-2xl relative space-y-6 border border-stone-200"
          >
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-2" aria-hidden="true"></div>
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 id="opportunity-modal-title" className="text-2xl font-extrabold text-stone-900">{selectedOpportunity.title}</h2>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-1">
                  {selectedOpportunity.category} · {selectedOpportunity.type || 'GRANT'}
                </p>
              </div>
              <button
                ref={modalCloseRef}
                type="button"
                onClick={() => setSelectedOpportunity(null)}
                aria-label="Close details"
                title="Close (Esc)"
                className="shrink-0 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 active:bg-stone-300 flex items-center justify-center text-stone-700 transition"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-stone-100 text-sm">
              <div>
                <span className="text-xs text-stone-400 block uppercase font-medium">Value</span>
                <span className="text-lg font-bold text-stone-900">{selectedOpportunity.value}</span>
              </div>
              <div>
                <span className="text-xs text-stone-400 block uppercase font-medium">Deadline</span>
                <span className="text-lg font-bold text-stone-900">{selectedOpportunity.deadline}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-stone-900 text-base">Description</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{selectedOpportunity.description}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-stone-900 text-base">Eligibility</h3>
              <ul className="list-disc list-inside text-sm text-stone-600 space-y-1">
                {selectedOpportunity.eligibility.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => addToComparison(selectedOpportunity)}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#4b583f] hover:bg-[#3d4833] active:bg-[#323b2a] text-white py-3.5 rounded-xl font-semibold shadow-md transition text-center"
              >
                {compareIds.includes(selectedOpportunity.id) ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Already added: view comparison
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    Add to Comparison Planner
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSelectedOpportunity(null)}
                className="w-full text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 py-2.5 rounded-xl"
              >
                Back to {TAB_LABELS[activeTab]}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
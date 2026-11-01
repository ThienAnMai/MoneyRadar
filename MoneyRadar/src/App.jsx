import React, { useState } from 'react';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'signin', 'signup', 'dashboard'
  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'radar', 'compare', 'active'
  const [selectedOpportunity, setSelectedOpportunity] = useState(null); // Modal state for view details

  const [profile, setProfile] = useState({
    employment: 'Part-time',
    education: 'Student',
    income: 'Under $30,000',
    location: 'Texas',
    experience: 'Entry-level',
    goal: 'Tuition support',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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
      id: 'fin-support',
      title: 'Financial Support',
      category: 'OTHER',
      value: 'Up to $750',
      deadline: '31 Dec 2026',
      description: 'Direct state tax return support for residents meeting income criteria.',
      eligibility: ['Resident in Texas', 'Income under $30,000'],
      status: 'Saved for later',
    },
  ];

  const toggleStep = (pursuitId, stepId) => {
    setActivePursuits((prev) =>
      prev.map((p) => {
        if (p.id !== pursuitId) return p;
        const updatedSteps = p.steps.map((s) => (s.id === stepId ? { ...s, checked: !s.checked } : s));
        return { ...p, steps: updatedSteps };
      })
    );
  };

  const toggleExpand = (pursuitId) => {
    setActivePursuits((prev) =>
      prev.map((p) => (p.id === pursuitId ? { ...p, expanded: !p.expanded } : p))
    );
  };

  // --- LANDING PAGE ---
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-white text-stone-900 flex flex-col font-sans">
        <header className="w-full border-b border-stone-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full border-2 border-stone-900 flex items-center justify-center font-bold text-lg">🎯</span>
            <span className="text-xl font-bold tracking-tight">Money Radar</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('signin')} className="text-sm font-medium text-stone-600 hover:text-stone-900 px-4 py-2">
              Sign In
            </button>
            <button onClick={() => setCurrentView('signup')} className="bg-[#4b583f] hover:bg-[#3d4833] text-white text-sm font-medium px-5 py-2 rounded-lg transition">
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
              <button onClick={() => setCurrentView('signup')} className="bg-[#4b583f] hover:bg-[#3d4833] text-white font-medium py-3 px-8 rounded-xl shadow-md transition text-center">
                Get Started
              </button>
              <button onClick={() => setCurrentView('signin')} className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium py-3 px-8 rounded-xl transition text-center">
                Sign In
              </button>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-72 h-72 md:w-96 md:h-96 bg-[#f4f6f0] rounded-3xl border-2 border-[#4b583f]/20 flex items-center justify-center shadow-lg relative">
              <span className="text-9xl animate-pulse">🎯</span>
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
            <span className="w-8 h-8 rounded-full border-2 border-stone-900 flex items-center justify-center font-bold">🎯</span>
            <span className="text-xl font-bold tracking-tight">Money Radar</span>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-stone-900">Sign In</h2>
          <p className="mt-2 text-center text-sm text-stone-600">Welcome back. Log in to your account.</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-stone-200 sm:px-10 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Email</label>
              <input type="email" placeholder="Enter your email" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b583f]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Password</label>
              <input type="password" placeholder="Enter your password" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b583f]" />
              <div className="text-right mt-1">
                <a href="#" className="text-xs text-[#4b583f] hover:underline">Forgot password?</a>
              </div>
            </div>

            <button onClick={() => setCurrentView('dashboard')} className="w-full bg-[#4b583f] hover:bg-[#3d4833] text-white font-medium py-2.5 rounded-lg transition">
              Sign In
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink mx-4 text-xs text-stone-400 uppercase">or</span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            <button onClick={() => setCurrentView('dashboard')} className="w-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm">
              Continue with Google
            </button>

            <p className="text-center text-sm text-stone-600 mt-4">
              Don't have an account?{' '}
              <button onClick={() => setCurrentView('signup')} className="text-[#4b583f] font-semibold hover:underline">Sign Up</button>
            </p>
            <div className="text-center mt-2">
              <button onClick={() => setCurrentView('landing')} className="text-xs text-stone-500 hover:underline">← Back to home</button>
            </div>
          </div>
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
            <span className="w-8 h-8 rounded-full border-2 border-stone-900 flex items-center justify-center font-bold">🎯</span>
            <span className="text-xl font-bold tracking-tight">Money Radar</span>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-stone-900">Sign Up</h2>
          <p className="mt-2 text-center text-sm text-stone-600">Create an account to find opportunities.</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-stone-200 sm:px-10 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Full Name</label>
              <input type="text" placeholder="Enter your full name" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b583f]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Email Address</label>
              <input type="email" placeholder="Enter your email" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b583f]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Password</label>
              <input type="password" placeholder="Create a password" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b583f]" />
            </div>
            <p className="text-xs text-stone-500">We'll use your profile to match you with relevant financial opportunities.</p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Employment Status</label>
              <select className="w-full px-4 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4b583f]">
                <option>Part-time</option>
                <option>Full-time</option>
                <option>Unemployed</option>
                <option>Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Income Range</label>
              <select className="w-full px-4 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4b583f]">
                <option>Under $30,000</option>
                <option>$30,000 - $60,000</option>
                <option>$60,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Education Level</label>
              <select className="w-full px-4 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4b583f]">
                <option>Student</option>
                <option>High School</option>
                <option>Bachelor's Degree</option>
                <option>Graduate</option>
              </select>
            </div>

            <button onClick={() => setCurrentView('dashboard')} className="w-full bg-[#4b583f] hover:bg-[#3d4833] text-white font-medium py-2.5 rounded-lg transition mt-4">
              Create Account
            </button>

            <p className="text-center text-sm text-stone-600 mt-4">
              Already have an account?{' '}
              <button onClick={() => setCurrentView('signin')} className="text-[#4b583f] font-semibold hover:underline">Log in →</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN WEB APP DASHBOARD ---
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans relative">
      {/* Top Header & Navigation Bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('landing')}>
              <span className="w-8 h-8 rounded-full border-2 border-stone-900 flex items-center justify-center font-bold">🎯</span>
              <span className="text-lg font-bold tracking-tight">Money Radar</span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('explore')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'explore' ? 'bg-[#f4f6f0] text-[#4b583f]' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                Explore
              </button>
              <button
                onClick={() => setActiveTab('radar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'radar' ? 'bg-[#f4f6f0] text-[#4b583f]' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                My Radar
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'compare' ? 'bg-[#f4f6f0] text-[#4b583f]' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                Compare & Plan
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'active' ? 'bg-[#f4f6f0] text-[#4b583f]' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                Active Pursuits
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('landing')} className="text-sm font-medium text-stone-500 hover:text-stone-800">
              Sign Out
            </button>
            <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center font-semibold text-stone-700 border border-stone-300">
              👤
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden bg-white border-b border-stone-200 px-4 py-2 flex justify-around text-xs font-medium text-stone-600">
        <button onClick={() => setActiveTab('explore')} className={activeTab === 'explore' ? 'text-[#4b583f] font-bold' : ''}>Explore</button>
        <button onClick={() => setActiveTab('radar')} className={activeTab === 'radar' ? 'text-[#4b583f] font-bold' : ''}>My Radar</button>
        <button onClick={() => setActiveTab('compare')} className={activeTab === 'compare' ? 'text-[#4b583f] font-bold' : ''}>Compare</button>
        <button onClick={() => setActiveTab('active')} className={activeTab === 'active' ? 'text-[#4b583f] font-bold' : ''}>Active</button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        
        {/* TAB 1: EXPLORE */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-stone-900">Explore Opportunities</h1>
              <p className="text-stone-600 text-sm mt-1">Browse available grants, tax credits, and financial benefits.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {opportunitiesList.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#4b583f] bg-[#f4f6f0] px-2.5 py-1 rounded-md">{item.category}</span>
                    <h3 className="text-lg font-bold text-stone-900 mt-3">{item.title}</h3>
                    <p className="text-sm text-stone-600 mt-1">{item.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOpportunity(item)}
                    className="mt-6 text-sm font-semibold text-[#4b583f] hover:underline text-left"
                  >
                    View details →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MY RADAR */}
        {activeTab === 'radar' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold text-stone-900">My Radar</h1>
                <p className="text-stone-600 text-sm mt-1">Opportunities matched to your profile.</p>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-medium px-4 py-2 rounded-lg transition"
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
                <div><span className="text-stone-400 block text-xs">Employment</span> {profile.employment}</div>
                <div><span className="text-stone-400 block text-xs">Education</span> {profile.education}</div>
                <div><span className="text-stone-400 block text-xs">Income</span> {profile.income}</div>
                <div><span className="text-stone-400 block text-xs">Location</span> {profile.location}</div>
                <div><span className="text-stone-400 block text-xs">Experience</span> {profile.experience}</div>
                <div><span className="text-stone-400 block text-xs">Current Goal</span> {profile.goal}</div>
              </div>
            </div>

            {/* Questionnaire panel */}
            {isEditingProfile && (
              <div className="bg-[#f4f6f0] p-6 rounded-2xl border border-[#4b583f]/30 space-y-4">
                <h3 className="font-bold text-[#4b583f] text-lg">Update Profile Questionnaire</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Employment</label>
                    <input
                      type="text"
                      value={profile.employment}
                      onChange={(e) => setProfile({ ...profile, employment: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Education</label>
                    <input
                      type="text"
                      value={profile.education}
                      onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="bg-[#4b583f] hover:bg-[#3d4833] text-white text-sm font-medium px-6 py-2.5 rounded-lg transition"
                >
                  Save and Scan
                </button>
              </div>
            )}

            {/* Recommendations */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-stone-900 text-lg">New Recommendations ({opportunitiesList.length})</h3>
                <button className="text-xs text-[#4b583f] font-semibold hover:underline">Scan again</button>
              </div>

              {opportunitiesList.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-[#4b583f] bg-[#f4f6f0] px-2.5 py-1 rounded">{item.category}</span>
                    <h4 className="font-bold text-stone-900 mt-2">{item.title}</h4>
                    <p className="text-xs text-stone-500">Based on your {item.category.toLowerCase()} profile</p>
                  </div>
                  <button
                    onClick={() => setSelectedOpportunity(item)}
                    className="text-sm font-semibold text-[#4b583f] hover:underline"
                  >
                    View details →
                  </button>
                </div>
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
              <h3 className="font-bold text-stone-900 text-lg">Compare side by side</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border-2 border-[#4b583f]/40 shadow-sm space-y-4">
                  <h4 className="font-bold text-stone-900 text-xl">Education Grant</h4>
                  <div className="text-sm space-y-1 text-stone-600 border-t border-b border-stone-100 py-3">
                    <p className="text-xs text-stone-400 uppercase font-semibold">Demo value</p>
                    <p className="text-stone-900 font-bold text-lg">Up to $1,000</p>
                    <p className="text-xs text-stone-400 uppercase font-semibold mt-2">Demo deadline</p>
                    <p className="text-stone-900 font-medium">30 Nov 2026</p>
                  </div>
                  <p className="text-xs text-stone-600">Course fees and study materials.</p>
                  <button
                    onClick={() => setActiveTab('active')}
                    className="w-full bg-[#4b583f] hover:bg-[#3d4833] text-white py-2.5 rounded-lg font-medium text-sm transition"
                  >
                    Pursue
                  </button>
                </div>

                <div className="bg-white p-6 rounded-2xl border-2 border-[#4b583f]/40 shadow-sm space-y-4">
                  <h4 className="font-bold text-stone-900 text-xl">Employment Benefit</h4>
                  <div className="text-sm space-y-1 text-stone-600 border-t border-b border-stone-100 py-3">
                    <p className="text-xs text-stone-400 uppercase font-semibold">Demo value</p>
                    <p className="text-stone-900 font-bold text-lg">Up to $500</p>
                    <p className="text-xs text-stone-400 uppercase font-semibold mt-2">Demo deadline</p>
                    <p className="text-stone-900 font-medium">15 Dec 2026</p>
                  </div>
                  <p className="text-xs text-stone-600">Work-related training costs.</p>
                  <button
                    onClick={() => setActiveTab('active')}
                    className="w-full bg-[#4b583f] hover:bg-[#3d4833] text-white py-2.5 rounded-lg font-medium text-sm transition"
                  >
                    Pursue
                  </button>
                </div>
              </div>
            </div>

            {/* Saved Queue */}
            <div className="space-y-4">
              <h3 className="font-bold text-stone-900 text-lg">Saved queue (3)</h3>
              <div className="space-y-3">
                {opportunitiesList.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-stone-900">{item.title}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">{item.status}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-stone-400 uppercase block">Compare</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('active')}
                        className="border border-[#4b583f] text-[#4b583f] hover:bg-[#4b583f] hover:text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        Pursue
                      </button>
                    </div>
                  </div>
                ))}
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

                return (
                  <div key={pursuit.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(pursuit.id)}>
                      <div>
                        <span className="text-xs font-bold text-[#4b583f] bg-[#f4f6f0] px-2.5 py-1 rounded">{pursuit.category}</span>
                        <h3 className="font-bold text-stone-900 text-lg mt-1">{pursuit.title}</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-stone-500 font-medium">{completedCount} of {pursuit.steps.length} steps</span>
                        <span className="text-stone-400">{pursuit.expanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#4b583f] h-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                    </div>

                    {pursuit.expanded && (
                      <div className="space-y-2 pt-2 border-t border-stone-100">
                        {pursuit.steps.map((step) => (
                          <label key={step.id} className="flex items-center gap-3 cursor-pointer py-1.5 px-2 hover:bg-stone-50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={step.checked}
                              onChange={() => toggleStep(pursuit.id, step.id)}
                              className="w-4 h-4 text-[#4b583f] rounded border-stone-300 focus:ring-[#4b583f]"
                            />
                            <span className={`text-sm ${step.checked ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                              {step.label}
                            </span>
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

      {/* VIEW DETAILS POP-UP MODAL (Matching Image 1) */}
      {selectedOpportunity && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl relative space-y-6 border border-stone-200">
            {/* Top modal handle indicator & Close button */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-2"></div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-extrabold text-stone-900">{selectedOpportunity.title}</h2>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-1">
                  {selectedOpportunity.category} · GRANT
                </p>
              </div>
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Value & Deadline Grid */}
            <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-stone-100 text-sm">
              <div>
                <span className="text-xs text-stone-400 block uppercase font-medium">Demo value</span>
                <span className="text-lg font-bold text-stone-900">{selectedOpportunity.value}</span>
              </div>
              <div>
                <span className="text-xs text-stone-400 block uppercase font-medium">Demo deadline</span>
                <span className="text-lg font-bold text-stone-900">{selectedOpportunity.deadline}</span>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <h3 className="font-bold text-stone-900 text-base">Description</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{selectedOpportunity.description}</p>
            </div>

            {/* Eligibility Section */}
            <div className="space-y-2">
              <h3 className="font-bold text-stone-900 text-base">Eligibility</h3>
              <ul className="list-disc list-inside text-sm text-stone-600 space-y-1">
                {selectedOpportunity.eligibility.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* Add to Comparison Planner Button */}
            <button
              onClick={() => {
                setSelectedOpportunity(null);
                setActiveTab('compare');
              }}
              className="w-full bg-[#4b583f] hover:bg-[#3d4833] text-white py-3.5 rounded-xl font-semibold shadow-md transition text-center"
            >
              Add to Comparison Planner
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
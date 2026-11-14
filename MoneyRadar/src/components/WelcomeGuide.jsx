import { ArrowRightIcon, ChecklistIcon, CloseIcon, CompareIcon, ExploreIcon, RadarIcon } from './icons.jsx';

const GUIDE_STEPS = [
  { tab: 'explore', Icon: ExploreIcon, title: 'Explore', text: 'Browse grants, benefits, and credits you may not know about.' },
  { tab: 'radar', Icon: RadarIcon, title: 'My Radar', text: 'Keep your profile current to see recommendations for you.' },
  { tab: 'compare', Icon: CompareIcon, title: 'Compare & Plan', text: 'Line up options side by side and pick one to pursue.' },
  { tab: 'active', Icon: ChecklistIcon, title: 'Active Pursuits', text: 'Follow a step-by-step checklist and track your progress.' },
];

// Dismissible, non-blocking introduction shown above the page content.
export default function WelcomeGuide({ activeTab, onNavigate, onDismiss }) {
  return (
    <section
      aria-labelledby="welcome-guide-title"
      className="relative bg-white border border-[#4b583f]/30 rounded-2xl p-5 md:p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="welcome-guide-title" className="text-lg font-bold text-stone-900">
            New to Money Radar? Here's how it works
          </h2>
          <p className="hidden sm:block text-sm text-stone-600 mt-1">Four sections, in the order most people use them. Select one to jump there.</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 inline-flex items-center gap-1.5 bg-[#4b583f] hover:bg-[#3d4833] active:bg-[#323b2a] text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <CloseIcon className="w-4 h-4" />
          Got it, hide guide
        </button>
      </div>

      <ol className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
        {GUIDE_STEPS.map(({ tab, Icon, title, text }, index) => {
          const isCurrent = activeTab === tab;
          return (
            <li key={tab}>
              <button
                type="button"
                onClick={() => onNavigate(tab)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`group w-full h-full text-left p-3 rounded-xl border transition hover:border-[#4b583f] hover:bg-[#f4f6f0] active:bg-[#e9eee2] ${isCurrent ? 'border-[#4b583f] bg-[#f4f6f0]' : 'border-stone-200'}`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-[#4b583f] leading-tight">
                  <span className="w-6 h-6 rounded-full bg-[#4b583f] text-white text-xs flex items-center justify-center shrink-0" aria-hidden="true">
                    {index + 1}
                  </span>
                  <Icon className="w-4 h-4 shrink-0" />
                  {title}
                </span>
                <span className="hidden sm:block text-xs text-stone-600 mt-2 leading-relaxed">{text}</span>
                {isCurrent ? (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-stone-500">You are here</span>
                ) : (
                  <span className="mt-2 hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#4b583f] opacity-80 group-hover:opacity-100">
                    Go to {title}
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

import { BriefcaseIcon, CoinIcon, GradCapIcon } from './icons.jsx';

// Each category gets its own icon and tint so categories are distinguishable
// without relying on color alone (the text label is always shown).
const CATEGORY_STYLES = {
  EDUCATION: { Icon: GradCapIcon, className: 'bg-[#f4f6f0] text-[#4b583f] ring-[#4b583f]/20' },
  EMPLOYMENT: { Icon: BriefcaseIcon, className: 'bg-amber-50 text-amber-800 ring-amber-700/20' },
  OTHER: { Icon: CoinIcon, className: 'bg-sky-50 text-sky-800 ring-sky-700/20' },
};

const FALLBACK_STYLE = { Icon: CoinIcon, className: 'bg-[#f4f6f0] text-[#4b583f] ring-[#4b583f]/20' };

export default function CategoryBadge({ category }) {
  const { Icon, className } = CATEGORY_STYLES[category] ?? FALLBACK_STYLE;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md ring-1 ring-inset ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {category}
    </span>
  );
}

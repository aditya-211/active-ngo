import { NGO } from '../types';
import { motion } from 'motion/react';
import {
  BookOpen,
  HeartPulse,
  Leaf,
  ShieldAlert,
  Soup,
  Droplet,
  Globe,
  MapPin,
  Clock,
  Award,
  ChevronRight
} from 'lucide-react';

interface NgoCardProps {
  ngo: NGO;
  sequenceNumber: number;
  isSelected: boolean;
  onSelect: () => void;
  key?: string | number;
}

const getCauseIcon = (cause: NGO['cause']) => {
  switch (cause) {
    case 'Education & Tech':
      return <BookOpen className="w-3.5 h-3.5" />;
    case 'Healthcare & Medicine':
      return <HeartPulse className="w-3.5 h-3.5" />;
    case 'Environment & Conservation':
      return <Leaf className="w-3.5 h-3.5" />;
    case 'Disaster & Crisis Relief':
      return <ShieldAlert className="w-3.5 h-3.5" />;
    case 'Hunger & Nutrition':
      return <Soup className="w-3.5 h-3.5" />;
    case 'Water & Sanitation':
      return <Droplet className="w-3.5 h-3.5" />;
  }
};

const getCauseStyles = (cause: NGO['cause']) => {
  switch (cause) {
    case 'Education & Tech':
      return 'bg-[#E7EBDD] text-[#526147] border-[#CDD3C0]';
    case 'Healthcare & Medicine':
      return 'bg-[#F1E4DC] text-[#96553F] border-[#E1C8B9]';
    case 'Environment & Conservation':
      return 'bg-[#E4EADF] text-[#42664D] border-[#C7D4C2]';
    case 'Disaster & Crisis Relief':
      return 'bg-[#F2E9D7] text-[#80653A] border-[#E0D2B6]';
    case 'Hunger & Nutrition':
      return 'bg-[#F3E5D7] text-[#925C3D] border-[#E5CEB9]';
    case 'Water & Sanitation':
      return 'bg-[#E2EAE8] text-[#4D6861] border-[#C7D7D2]';
  }
};

export function NgoCard({ ngo, sequenceNumber, isSelected, onSelect }: NgoCardProps) {
  const formattedSeq = String(sequenceNumber).padStart(2, '0');
  const ratingScore = parseFloat(ngo.rating.split('/')[0]);
  const ratingLabel = Number.isFinite(ratingScore) ? ngo.rating.split(' ')[0] : 'Not rated';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`View ${ngo.name} organization details`}
      className={`relative group cursor-pointer border bg-[#FBF9F3] p-5 transition-all duration-200 ai-glow-hover sm:p-6 ${
        isSelected
          ? 'border-l-[3px] border-y-[#244C3B] border-r-[#D6CEBD] border-l-[#244C3B]'
          : 'border-[#D6CEBD] hover:border-[#788365]'
      }`}
    >
      {/* Top Section with Index and Cause */}
      <div className="mb-4 flex items-start justify-between gap-4 border-b border-[#E5DFD3] pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-[#B66549] group-hover:text-indigo-700 transition-colors">
            FIELD NOTE {formattedSeq}
          </span>
          <span
            className={`flex items-center gap-1.5 px-2 py-1 text-[9px] font-semibold tracking-wide border transition-colors ${getCauseStyles(
              ngo.cause
            )}`}
          >
            {getCauseIcon(ngo.cause)}
            {ngo.cause}
          </span>
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 border ${
          Number.isFinite(ratingScore)
            ? 'text-amber-700 bg-amber-50/80 border-amber-100/50'
            : 'text-gray-500 bg-gray-50 border-gray-200'
        }`}>
          <Award className="w-3.5 h-3.5 text-[#B66549]" />
          <span>{ratingLabel}</span>
        </div>
      </div>

      {/* Main details */}
      <div className="space-y-1.5">
        <h3 className="flex items-center justify-between gap-2 font-serif text-xl font-normal leading-tight tracking-tight text-[#292C27] group-hover:text-indigo-700 transition-colors sm:text-2xl">
          {ngo.name}
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors transform group-hover:translate-x-0.5" />
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
          {ngo.description}
        </p>
      </div>

      {/* Core Meta tags */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-[#E5DFD3] pt-4 font-mono text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#B66549]" />
          <span className="truncate">{ngo.headquarters}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <Globe className="w-3.5 h-3.5 shrink-0 text-[#788365]" />
          <span className="truncate">{ngo.scope} Operations</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <Clock className="w-3.5 h-3.5 shrink-0 text-[#788365]" />
          <span>Est. {ngo.founded}</span>
        </div>
        <div className={`flex items-center gap-1.5 min-w-0 font-semibold ${ngo.isDraft ? 'text-amber-700' : 'text-indigo-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ngo.isDraft ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="truncate">{ngo.isDraft ? 'Draft profile' : 'Open Positions'}</span>
        </div>
      </div>

      {/* Active Location Area / State / City */}
      <div className="mt-4 border-l-2 border-[#788365] bg-[#F1EEE5] px-3.5 py-2.5 text-xs text-gray-600">
        <span className="mb-1 block font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-[#788365]">Working across</span>
        <span className="line-clamp-1 leading-5">{ngo.activeLocation}</span>
      </div>

      {/* Active opportunities sneak-peek */}
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {ngo.activeOpportunities.slice(0, 2).map((opp, oIndex) => (
          <span
            key={oIndex}
            className="inline-block border-b border-[#D6CEBD] px-1.5 py-1 text-[10px] text-gray-600"
          >
            {opp}
          </span>
        ))}
        {ngo.activeOpportunities.length > 2 && (
          <span           className="inline-block px-1.5 py-1 font-mono text-[9px] text-gray-500">
            +{ngo.activeOpportunities.length - 2} more
          </span>
        )}
      </div>

      {/* Bottom redirection teaser */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E5DFD3] pt-3 text-xs text-gray-500 transition-colors group-hover:text-indigo-700">
        <span className="truncate">Impact · {ngo.impactSummary.split(' helping')[0]}</span>
        <span className="flex shrink-0 items-center gap-1 font-semibold text-indigo-700 opacity-0 transition-all group-hover:opacity-100">
          Explore →
        </span>
      </div>
    </motion.div>
  );
}

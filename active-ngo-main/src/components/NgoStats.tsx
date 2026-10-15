import { NGO } from '../types';
import { Award, HandHelping, Globe, Layers } from 'lucide-react';

interface NgoStatsProps {
  ngos: NGO[];
}

export function NgoStats({ ngos }: NgoStatsProps) {
  const activeNgos = ngos.filter((ngo) => !ngo.isDraft);
  const totalRoles = activeNgos.reduce((acc, ngo) => acc + ngo.activeOpportunities.length, 0);
  const uniqueCauses = new Set(activeNgos.map((ngo) => ngo.cause)).size;
  const highestRating = activeNgos.reduce((max, ngo) => {
    const rating = parseFloat(ngo.rating.split('/')[0]);
    return Number.isFinite(rating) && rating > max ? rating : max;
  }, 0);

  const metrics = [
    { label: 'Active organizations', value: activeNgos.length, note: 'Community partners', icon: Globe },
    { label: 'Open opportunities', value: totalRoles, note: 'Ways to contribute', icon: HandHelping },
    { label: 'Fields of impact', value: uniqueCauses, note: 'Across social causes', icon: Layers },
    { label: 'Highest rating', value: highestRating > 0 ? highestRating.toFixed(1) : '—', note: 'Out of 100 · where rated', icon: Award },
  ];

  return (
    <section aria-label="Directory at a glance" className="grid grid-cols-2 border-y border-[#D6CEBD] bg-[#EAE5D9]/55 lg:grid-cols-4">
      {metrics.map(({ label, value, note, icon: Icon }, index) => (
        <div
          key={label}
          className={`flex min-h-28 items-center gap-3 px-4 py-5 sm:gap-4 sm:px-6 sm:py-6 ${
            index % 2 === 1 ? 'border-l border-[#D6CEBD] lg:border-l-0' : ''
          } ${index >= 2 ? 'border-t border-[#D6CEBD] lg:border-t-0' : ''} ${
            index > 0 ? 'lg:border-l lg:border-[#D6CEBD]' : ''
          }`}
        >
          <Icon className="hidden h-5 w-5 shrink-0 text-[#788365] sm:block" strokeWidth={1.5} />
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-gray-500 sm:text-[10px]">
              {label}
            </p>
            <p className="mt-0.5 font-serif text-3xl leading-none text-[#244C3B] sm:text-4xl">{value}</p>
            <p className="mt-1 text-[10px] text-gray-500 sm:text-[11px]">{note}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

import { useState, useMemo, useEffect, useRef } from 'react';
import { CAUSES } from './data';
import { NGO, Cause, Scope, SortBy } from './types';
import { NgoCard } from './components/NgoCard';
import { NgoDetailPanel } from './components/NgoDetailPanel';
import { NgoStats } from './components/NgoStats';
import { AdminPanel } from './components/AdminPanel';
import { loadNGOsFromStorage, saveNGOsToStorage } from './adminStorage';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  HandHelping,
  Globe,
  Sparkles,
  ArrowRight,
  Info,
  Settings2,
  House,
  Compass,
  Building2
} from 'lucide-react';

const AI_PROMPTS = [
  { label: 'School meals · Karnataka', query: 'Akshaya Patra Karnataka' },
  { label: 'Mobile clinics · Delhi NCR', query: 'Smile Delhi NCR' },
  { label: 'Elementary literacy · Bihar', query: 'Pratham Bihar' },
  { label: 'Rural material kits · Odisha', query: 'Goonj Odisha' },
  { label: 'Wildlife corridors · Assam', query: 'Wildlife Assam' },
  { label: 'Water & sanitation · Uttar Pradesh', query: 'Sulabh Uttar Pradesh' },
];

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'organizations', label: 'Organizations', icon: Building2 },
  { id: 'about', label: 'About', icon: Info },
];

export default function App() {
  const [initialNGOs] = useState(loadNGOsFromStorage);
  const [ngos, setNgos] = useState(initialNGOs.ngos);
  const [storageError, setStorageError] = useState<string | null>(initialNGOs.error);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const skippedInitialPersistence = useRef(false);

  useEffect(() => {
    if (!skippedInitialPersistence.current) {
      skippedInitialPersistence.current = true;
      return;
    }

    try {
      saveNGOsToStorage(ngos);
      setStorageError(null);
    } catch {
      setStorageError('Changes could not be saved in this browser. Check available storage and browser privacy settings.');
    }
  }, [ngos]);

  useEffect(() => {
    if (isAdminOpen) return;

    const sections = NAV_ITEMS.map(({ id }) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visibleSection) setActiveSection(visibleSection.target.id);
      },
      { rootMargin: '-18% 0px -70% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isAdminOpen]);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCause, setSelectedCause] = useState<Cause | 'All'>('All');
  const [selectedScope, setSelectedScope] = useState<Scope | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortBy>('rating');
  const [selectedNgoId, setSelectedNgoId] = useState<string | null>(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);

  // Automatically select the first NGO on load
  useEffect(() => {
    if (ngos.length > 0 && !selectedNgoId) {
      setSelectedNgoId(ngos[0].id);
    }
  }, [ngos, selectedNgoId]);

  // Handle Search & Filter logic
  const filteredNgos = useMemo(() => {
    return ngos.filter((ngo) => {
      // Cause Match
      if (selectedCause !== 'All' && ngo.cause !== selectedCause) {
        return false;
      }
      // Scope Match
      if (selectedScope !== 'All' && ngo.scope !== selectedScope) {
        return false;
      }
      // Search query Match (matches name, description, headquarters, activeLocation, opportunities, requirements)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = ngo.name.toLowerCase().includes(query);
        const matchesDesc = ngo.description.toLowerCase().includes(query) || ngo.extendedDescription.toLowerCase().includes(query);
        const matchesHq = ngo.headquarters.toLowerCase().includes(query);
        const matchesActiveLoc = ngo.activeLocation.toLowerCase().includes(query);
        const matchesOpps = ngo.activeOpportunities.some((opp) => opp.toLowerCase().includes(query));
        const matchesReqs = ngo.requirements.some((req) => req.toLowerCase().includes(query));
        
        return matchesName || matchesDesc || matchesHq || matchesActiveLoc || matchesOpps || matchesReqs;
      }
      return true;
    }).sort((a, b) => {
      // Sort logic
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'founded') {
        // Oldest founded first
        return a.founded - b.founded;
      } else if (sortBy === 'rating') {
        // Highest rating first
        const ratingA = parseFloat(a.rating.split('/')[0]);
        const ratingB = parseFloat(b.rating.split('/')[0]);
        if (!Number.isFinite(ratingA)) return Number.isFinite(ratingB) ? 1 : a.name.localeCompare(b.name);
        if (!Number.isFinite(ratingB)) return -1;
        return ratingB - ratingA;
      }
      return 0;
    });
  }, [ngos, searchQuery, selectedCause, selectedScope, sortBy]);

  // Find currently selected NGO details
  const selectedNgo = useMemo(() => {
    return ngos.find((ngo) => ngo.id === selectedNgoId) || null;
  }, [ngos, selectedNgoId]);

  // Ensure selected NGO remains valid during filtering, auto-fallback to first filtered match
  useEffect(() => {
    if (filteredNgos.length > 0) {
      const isStillInList = filteredNgos.some((ngo) => ngo.id === selectedNgoId);
      if (!isStillInList) {
        setSelectedNgoId(filteredNgos[0].id);
      }
    } else {
      if (filteredNgos.length === 0) {
        setSelectedNgoId(null);
      }
    }
  }, [filteredNgos, selectedNgoId]);

  const handleNgoSelect = (ngoId: string) => {
    setSelectedNgoId(ngoId);
    setIsMobileDetailOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCause('All');
    setSelectedScope('All');
    setSortBy('rating');
    if (ngos.length > 0) {
      setSelectedNgoId(ngos[0].id);
    }
  };

  // Quick prompt handler simulating smart search query
  const handlePromptClick = (queryText: string) => {
    setIsAiSearching(true);
    setSearchQuery(queryText);
    setSelectedCause('All');
    setSelectedScope('All');
    
    setTimeout(() => {
      setIsAiSearching(false);
    }, 450);
  };

  return (
    <div className="paper-grain min-h-screen flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Editorial archive navigation */}
      <header className="sticky top-0 z-40 border-b border-[#D6CEBD] bg-[#F3EFE5]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
          <a href="#home" className="group flex min-w-0 flex-1 items-center gap-3 focus-visible:outline-offset-4 lg:flex-none">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#788365]/40 bg-[#244C3B] text-white transition-colors group-hover:bg-[#193429]">
              <HandHelping className="h-[18px] w-[18px] text-[#E5E8D8]" />
            </span>
            <span className="min-w-0">
              <span className="block whitespace-nowrap text-[17px] font-medium tracking-[-0.04em] text-[#292C27] sm:text-[19px]">
                SAMARPAN <span className="font-serif font-normal italic text-[#244C3B]">Archive</span>
              </span>
              <span className="hidden whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.12em] text-gray-500 sm:block">
                Indian NGO &amp; Volunteer Network
              </span>
            </span>
          </a>

          {!isAdminOpen && (
            <nav aria-label="Main navigation" className="order-3 -mx-1 flex w-[calc(100%+0.5rem)] items-center gap-1 overflow-x-auto border-t border-[#D6CEBD] px-1 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:order-none lg:mx-0 lg:w-auto lg:border-t-0 lg:px-0 lg:pt-0 lg:shrink-0">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={activeSection === id ? 'location' : undefined}
                  className={`group relative inline-flex shrink-0 items-center gap-1.5 px-2 py-2 text-[10px] transition-colors duration-300 sm:px-3.5 sm:text-xs ${
                    activeSection === id
                      ? 'font-semibold text-[#244C3B] after:absolute after:inset-x-3 after:-bottom-[13px] after:h-px after:bg-[#B66549] lg:after:-bottom-[22px]'
                      : 'font-medium text-gray-600 hover:text-[#244C3B]'
                  }`}
                  style={{ position: 'relative' }}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </a>
              ))}
            </nav>
          )}

          <div className="flex shrink-0 items-center gap-2.5">
            <span className="hidden items-center gap-2 border-l border-[#D6CEBD] pl-4 text-[10px] font-medium text-gray-600 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#788365]" />
              <span className="font-mono font-semibold text-[#315b43]">{ngos.length}</span>
              <span>organizations</span>
            </span>
            <button
              onClick={() => setIsAdminOpen((open) => !open)}
              className={`inline-flex items-center gap-1.5 border px-3.5 py-2 text-xs font-semibold transition-colors duration-300 ${
                isAdminOpen
                  ? 'border-[#244C3B] bg-[#244C3B] text-[#F3EFE5] hover:bg-[#193429]'
                  : 'border-[#788365]/55 bg-transparent text-[#244C3B] hover:border-[#244C3B] hover:bg-[#E8E3D6]'
              }`}
              aria-expanded={isAdminOpen}
            >
              <Settings2 className="h-3.5 w-3.5" />
              {isAdminOpen ? 'Close admin' : 'Admin'}
            </button>
          </div>
        </div>
      </header>

      {isAdminOpen ? (
        <AdminPanel
          ngos={ngos}
          storageError={storageError}
          onSave={setNgos}
          onClose={() => setIsAdminOpen(false)}
        />
      ) : (
      <>
      {storageError && (
        <div role="alert" className="mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-7xl items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]">
          <Info className="mt-0.5 h-4 w-4 shrink-0" /> {storageError}
        </div>
      )}
      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        
        <section id="home" className="hero-editorial scroll-mt-32 relative grid items-center gap-8 border-b border-[#D6CEBD] pb-10 sm:gap-12 sm:pb-14 lg:min-h-[min(690px,calc(100svh-76px))] lg:grid-cols-[0.94fr_1.06fr] lg:gap-6 lg:pb-12">
          <div className="hero-copy relative z-10 max-w-2xl py-3 sm:py-8 lg:py-12">
            <p className="hero-reveal hero-reveal-1 mb-6 flex items-center gap-3 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-[#788365] sm:text-[10px]">
              <span className="h-px w-9 bg-[#B66549]" />
              India <span className="text-[#B66549]">·</span> Social impact network
            </p>
            <h1 className="hero-reveal hero-reveal-2 max-w-[13ch] font-serif text-[3.1rem] font-normal leading-[0.98] tracking-[-0.035em] text-[#292C27] sm:text-6xl lg:text-[5.15rem]">
              Where good work <span className="hero-headline-accent italic text-[#244C3B]">finds</span> willing hands.
            </h1>
            <p className="hero-reveal hero-reveal-3 mt-6 max-w-lg text-[13px] leading-7 text-[#55574F] sm:mt-7 sm:text-[15px] sm:leading-8">
              A living archive of Indian organizations and the people building a more equitable future. Find meaningful ways to show up, close to home or across the country.
            </p>
            <div className="hero-reveal hero-reveal-4 mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 sm:mt-8">
              <a href="#explore" className="hero-primary group inline-flex items-center gap-3 border border-[#244C3B] bg-[#244C3B] px-5 py-3 text-[12px] font-semibold text-[#F3EFE5] transition-colors duration-300 hover:border-[#193429] hover:bg-[#193429] focus-visible:outline-offset-4 sm:px-6 sm:py-3.5 sm:text-[13px]">
                Explore Organizations <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href="#explore" className="group inline-flex items-center gap-2 border-b border-[#B66549]/70 pb-1 text-[12px] font-semibold text-[#244C3B] transition-colors duration-300 hover:border-[#244C3B] hover:text-[#193429] sm:text-[13px]">
                Join the network <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
            <p className="hero-reveal hero-reveal-5 mt-8 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[#726F65] sm:mt-10">
              <span className="h-1.5 w-1.5 rounded-full bg-[#788365]" />
              {ngos.filter((ngo) => !ngo.isDraft).length} organizations <span className="text-[#B66549]">/</span> across India
            </p>
          </div>

          <div className="hero-art relative mx-auto h-[360px] w-full max-w-[620px] sm:h-[470px] lg:h-[min(570px,68vh)] lg:min-h-[470px]" aria-label="Community-led work across India">
            <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
            <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
            <svg className="hero-botanical pointer-events-none absolute -right-1 top-0 z-0 h-44 w-32 text-[#788365]/60 sm:right-0 sm:h-56 sm:w-40" viewBox="0 0 160 220" fill="none" aria-hidden="true">
              <path d="M148 214C126 173 119 128 127 82C131 57 142 31 155 9" stroke="currentColor" strokeWidth="1.2" />
              <path d="M134 133C111 127 97 111 91 88C114 90 131 105 134 133Z" stroke="currentColor" strokeWidth="1.1" />
              <path d="M126 95C108 84 101 66 104 45C122 55 131 72 126 95Z" stroke="currentColor" strokeWidth="1.1" />
              <path d="M138 61C135 43 143 27 158 15C163 34 156 51 138 61Z" stroke="currentColor" strokeWidth="1.1" />
            </svg>
            <figure className="hero-photo hero-photo-main absolute left-[8%] top-[7%] z-10 h-[76%] w-[72%] border-[7px] border-[#F8F5ED] bg-[#D6CEBD] shadow-[0_18px_45px_rgba(41,44,39,0.13)] sm:left-[10%] sm:top-[5%] sm:w-[70%] sm:border-[9px]">
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=85"
                alt="Volunteers working side by side at a community outreach event"
                className="h-full w-full object-cover object-center"
                fetchPriority="high"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-[#18251e]/55 via-transparent to-[#18251e]/5" />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-[#FBF9F3] sm:p-5">
                <span className="max-w-[190px] font-serif text-lg leading-tight sm:text-[22px]">Change is built together.</span>
                <span className="border-l border-white/50 pl-2.5 font-mono text-[8px] uppercase leading-relaxed tracking-[0.11em] text-white/85 sm:text-[9px]">People<br />Purpose<br />Place</span>
              </figcaption>
            </figure>
            <figure className="hero-photo hero-photo-inset absolute bottom-[5%] right-[1%] z-20 h-[43%] w-[43%] border-[6px] border-[#F8F5ED] bg-[#D6CEBD] shadow-[0_14px_35px_rgba(41,44,39,0.16)] sm:bottom-[4%] sm:right-[4%] sm:h-[44%] sm:w-[41%] sm:border-[8px]">
              <img
                src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=700&q=85"
                alt="Women gathered for a community learning initiative"
                className="h-full w-full object-cover object-center"
                loading="eager"
              />
              <figcaption className="absolute bottom-0 left-0 bg-[#244C3B] px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-[#F3EFE5] sm:px-3 sm:text-[9px]">Learning · India</figcaption>
            </figure>
            <div className="hero-photo-label absolute left-0 top-[40%] z-30 border border-[#D6CEBD] bg-[#F3EFE5] px-3 py-2 shadow-[0_5px_18px_rgba(41,44,39,0.07)] sm:left-[1%] sm:top-[43%] sm:px-4 sm:py-2.5">
              <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-[#B66549]">On the ground</p>
              <p className="mt-1 font-serif text-[14px] text-[#292C27] sm:text-base">Across communities</p>
            </div>
            <div className="hero-draw-line absolute bottom-[3%] left-[8%] z-0 h-px w-[68%] origin-left bg-[#B66549]/70" aria-hidden="true" />
            <span className="absolute right-[5%] top-[2%] z-10 font-mono text-[8px] uppercase tracking-[0.14em] text-[#788365] sm:right-[9%] sm:top-[0%] sm:text-[9px]">A living archive / India</span>
          </div>
        </section>

        <section aria-labelledby="archive-at-a-glance">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="archive-at-a-glance" className="font-serif text-2xl text-[#292C27] sm:text-3xl">
              A closer look
            </h2>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-gray-500">
              01 / Directory at a glance
            </p>
          </div>
          <NgoStats ngos={filteredNgos} />
        </section>

        {/* Dynamic AI-inspired Search & Assistant Panel */}
        <div className="space-y-6">
          <div id="explore" className="scroll-mt-32 relative border-y border-[#D6CEBD] bg-[#F7F4EC]/75 px-4 py-6 sm:px-7 sm:py-8 space-y-6">
            
            {/* AI Accent Line */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500 fill-indigo-500/20" />
                  02 / Search the archive
                </label>
                <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Search matches state names, cities, opportunities, or causes
                </div>
              </div>

              {/* Enhanced Prominent Search Bar */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  {isAiSearching ? (
                    <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Ask or type, e.g. 'Healthcare in Tamil Nadu', 'Pratham', 'Nourishment children in Karnataka'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-32 py-4 text-sm bg-[#FBF9F3] rounded-sm placeholder-gray-400 border border-[#D6CEBD] outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 focus:bg-[#FBF9F3] transition-all text-neutral-900 font-sans sm:text-base"
                />
                
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-4 text-xs font-mono font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* AI Quick Prompts Pills Grid */}
            <div className="space-y-2.5 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
                Common starting points
              </p>
              <div className="flex flex-wrap gap-2">
                {AI_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => handlePromptClick(prompt.query)}
                    className="text-[11px] font-medium text-gray-700 bg-transparent hover:bg-[#E8E3D6] hover:text-indigo-700 border border-[#D6CEBD] rounded-sm px-3 py-1.5 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {prompt.label}
                    <ArrowRight className="w-3 h-3 text-gray-400 hover:text-indigo-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Standard Filters (Scope, Sort & Cause Badges) */}
            <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              
              {/* Category Cause Badges */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <button
                  onClick={() => setSelectedCause('All')}
                  className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-all cursor-pointer ${
                    selectedCause === 'All'
                      ? 'bg-[#244C3B] border-[#244C3B] text-[#FBF9F3]'
                      : 'bg-transparent border-[#D6CEBD] text-gray-600 hover:bg-[#EAE5D9]'
                  }`}
                >
                  All Causes
                </button>
                {CAUSES.map((cause) => {
                  const isActive = selectedCause === cause;
                  return (
                    <button
                      key={cause}
                      onClick={() => setSelectedCause(cause)}
                      className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#244C3B] border-[#244C3B] text-[#FBF9F3]'
                          : 'bg-transparent border-[#D6CEBD] text-gray-600 hover:bg-[#EAE5D9]'
                      }`}
                    >
                      {cause}
                    </button>
                  );
                })}
              </div>

              {/* Scope & Sort Inputs */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Scope filter */}
                <div className="flex items-center gap-2 border border-[#D6CEBD] rounded-sm bg-[#FBF9F3] px-3 py-1.5 shrink-0">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={selectedScope}
                    onChange={(e) => setSelectedScope(e.target.value as Scope | 'All')}
                    className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="All">All Operations</option>
                    <option value="National">National Level</option>
                    <option value="Regional">Regional / State Level</option>
                  </select>
                </div>

                {/* Sort controls */}
                <div className="flex items-center gap-2 border border-[#D6CEBD] rounded-sm bg-[#FBF9F3] px-3 py-1.5 shrink-0">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="name">Alphabetical (A-Z)</option>
                    <option value="founded">Founded (Oldest First)</option>
                  </select>
                </div>

                {/* Reset button */}
                {(searchQuery || selectedCause !== 'All' || selectedScope !== 'All' || sortBy !== 'rating') && (
                  <button
                    onClick={handleResetFilters}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Split Content Grid (Left Cards, Right Selected Sticky Details) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: NGO list in sequence */}
          <div id="organizations" className="scroll-mt-32 lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e4dc]">
              <h3 className="font-serif text-xl font-normal text-neutral-900 tracking-tight flex items-center gap-2">
                <span className="font-serif text-2xl sm:text-3xl">Organizations in the field</span>
                <span className="font-mono text-[10px] font-medium px-2.5 py-1 border border-[#D6CEBD] text-indigo-700">
                  {filteredNgos.length} Listed
                </span>
              </h3>
              <p className="hidden font-mono text-[9px] uppercase tracking-[0.1em] text-gray-500 sm:block">
                03 / Selected field partners
              </p>
              <p className="sr-only">
                Select an organization to open field details
              </p>
            </div>

            {filteredNgos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredNgos.map((ngo, idx) => (
                    <NgoCard
                      key={ngo.id}
                      ngo={ngo}
                      sequenceNumber={idx + 1}
                      isSelected={selectedNgoId === ngo.id}
                      onSelect={() => handleNgoSelect(ngo.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white border border-[#e7e8df] rounded-2xl shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <SlidersHorizontal className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-gray-800 font-serif text-lg italic">No Matching NGOs Found</p>
                <p className="text-gray-400 text-xs max-w-sm mx-auto mt-1 font-light">
                  No organization matched your specific AI search queries or filters. Try clicking one of our suggested quick prompt pills or reset.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-5 px-5 py-2.5 bg-[#244C3B] hover:bg-[#193429] text-[#FBF9F3] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Reset & View All
                </button>
              </motion.div>
            )}
          </div>

          {/* Right Column: Sticky details panel (Only visible on desktop) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-28 h-[calc(100vh-140px)]">
            <NgoDetailPanel
              ngo={selectedNgo}
              onClose={() => setSelectedNgoId(null)}
            />
          </div>
        </div>
      </main>

      {/* Mobile Drawer Slide-up (For screen sizes below lg) */}
      <AnimatePresence>
        {isMobileDetailOpen && selectedNgo && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDetailOpen(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />
            
            {/* Drawer body */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-h-[90vh] bg-white rounded-t-2xl overflow-hidden shadow-2xl flex flex-col z-10"
            >
              {/* Drag indicator bar */}
              <div className="w-full flex justify-center py-3 bg-gray-50 border-b border-gray-200">
                <div className="w-12 h-1.5 rounded-full bg-gray-300" />
              </div>

              {/* Mounted detail component */}
              <div className="flex-1 overflow-y-auto">
                <NgoDetailPanel
                  ngo={selectedNgo}
                  onClose={() => setIsMobileDetailOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>
      )}

      {/* Footer Branding */}
      <footer id="about" className="scroll-mt-28 mt-20 border-t border-[#D6CEBD] bg-[#EAE5D9]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_0.7fr] lg:px-8">
          <div>
            <a href="#home" className="inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#244C3B] text-white">
                <HandHelping className="h-4 w-4 text-[#E5E8D8]" />
              </span>
              <span className="font-serif text-lg font-semibold italic tracking-tight text-neutral-950">SAMARPAN Archive</span>
            </a>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
              A directory connecting volunteers with Indian organizations and their active community initiatives. Explore organizations by cause, location, and available roles.
            </p>
            <p className="mt-4 text-xs text-gray-400">
              SAMARPAN Archive initiative © {new Date().getFullYear()}
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#315b43]">Explore the directory</h2>
            <nav aria-label="Footer navigation" className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
              <a href="#home" className="transition hover:text-indigo-700">Home</a>
              <a href="#explore" className="transition hover:text-indigo-700">Search &amp; filters</a>
              <a href="#organizations" className="transition hover:text-indigo-700">Organizations</a>
              <a href="#about" className="transition hover:text-indigo-700">About</a>
            </nav>
            <p className="mt-4 text-xs leading-5 text-gray-400">
              Directory records and active opportunities may change. Contact each organization to confirm current details.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

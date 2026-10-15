import { NGO } from '../types';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ExternalLink,
  MapPin,
  Clock,
  Award,
  Globe,
  Mail,
  CheckCircle,
  FileText,
  User,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  HandHelping,
  ArrowUpRight
} from 'lucide-react';

interface NgoDetailPanelProps {
  ngo: NGO | null;
  onClose: () => void;
}

export function NgoDetailPanel({ ngo, onClose }: NgoDetailPanelProps) {
  // Application Helper form states
  const [userName, setUserName] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState('');
  const [userSkills, setUserSkills] = useState('');
  const [motivation, setMotivation] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Sync selected opportunity when NGO changes
  useEffect(() => {
    if (ngo) {
      setSelectedOpportunity(ngo.activeOpportunities[0] || '');
      setGeneratedLetter('');
    }
  }, [ngo]);

  if (!ngo) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full p-8 border border-dashed border-[#D6CEBD] bg-[#EAE5D9]/50">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAE5D9] text-indigo-700">
          <HandHelping className="w-8 h-8" />
        </div>
        <p className="font-semibold text-gray-800 text-lg">No NGO Selected</p>
        <p className="text-gray-500 text-sm text-center max-w-xs mt-1">
          Click on any active NGO card in the sequence to inspect requirements, active roles, and generate custom pitches.
        </p>
      </div>
    );
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(ngo.contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleGeneratePitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const todayStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const skillsText = userSkills.trim() ? `My skills include ${userSkills.toLowerCase()}.` : "I am highly motivated to offer my support and learning agility.";
    const motivationText = motivation.trim() ? motivation : `I highly admire your work in ${ngo.cause.toLowerCase()} and believe in making a direct contribution to your outstanding mission.`;

    const template = `Subject: Expression of Interest - ${selectedOpportunity} | ${userName}

Date: ${todayStr}

To the Volunteer Coordination Team,
${ngo.name}

I am writing to express my sincere interest in applying for the active "${selectedOpportunity}" opportunity with ${ngo.name}. Having closely followed your incredible impact in the field of ${ngo.cause}, particularly your milestone of "${ngo.impactSummary.split(' (')[0]}", I am deeply inspired to support your efforts.

${skillsText} ${motivationText}

I meet your requirements, including ${ngo.requirements.slice(0, 2).map(r => r.toLowerCase().replace(/^\*/, '')).join(' and ')}. I would love to schedule a brief call to discuss how my background can best assist your teams.

Thank you very much for your time and dedication to global progress.

Warm regards,
${userName}
Contact: (Please add your phone / email)
Generated via Active NGO Directory`;

    setGeneratedLetter(template);
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden border border-[#D6CEBD] bg-[#FBF9F3]">
      {/* Header Panel */}
      <div className="flex items-start justify-between border-b border-[#D6CEBD] bg-[#EAE5D9]/60 p-5 sm:p-6">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="border border-[#D6CEBD] bg-[#F3EFE5] px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-indigo-700">
              {ngo.cause}
            </span>
            <span className={`px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.08em] flex items-center gap-1 ${
              ngo.isDraft
                ? 'text-amber-700 bg-amber-50 border border-amber-200'
                : 'text-emerald-600 bg-emerald-50 border border-emerald-100'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${ngo.isDraft ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
              {ngo.isDraft ? 'Draft · verify details' : 'Active'}
            </span>
          </div>
          <h2 className="font-serif text-2xl font-normal leading-tight text-[#292C27] tracking-tight">
            {ngo.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main content scrollable area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Profile Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 border-y border-[#D6CEBD] bg-[#F3EFE5] p-3 text-center md:grid-cols-4">
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-semibold flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-amber-500" />
              Rating
            </div>
            <p className="text-sm font-bold text-gray-800">{ngo.rating ? ngo.rating.split(' ')[0] : 'Not rated'}</p>
          </div>
          <div className="space-y-0.5 border-l border-gray-200">
            <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-semibold flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              Founded
            </div>
            <p className="text-sm font-bold text-gray-800">{ngo.founded}</p>
          </div>
          <div className="space-y-0.5 border-l border-gray-200">
            <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-semibold flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              HQs
            </div>
            <p className="text-sm font-bold text-gray-800 truncate px-1" title={ngo.headquarters}>
              {ngo.headquarters}
            </p>
          </div>
          <div className="space-y-0.5 border-l border-gray-200">
            <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-semibold flex items-center justify-center gap-1">
              <Globe className="w-3 h-3 text-indigo-500" />
              Scope
            </div>
            <p className="text-sm font-bold text-gray-800">{ngo.scope}</p>
          </div>
        </div>

        {/* Mostly Active In State/City */}
        <div className="space-y-1.5 border-l-2 border-[#788365] bg-[#EAE5D9]/70 p-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 font-mono flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            Primary Active Regions (Mostly Active In)
          </h4>
          <p className="text-sm font-semibold text-indigo-950">
            {ngo.activeLocation}
          </p>
          <p className="text-[11px] text-gray-500">
            Field programs, local volunteer centers, and direct social initiatives are centered in these specific Indian states and cities.
          </p>
        </div>

        {/* Detailed description */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-mono">
            About the Organization
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed font-sans">
            {ngo.extendedDescription}
          </p>
          <div className="flex items-start gap-2.5 border-l-2 border-[#B66549] bg-[#F1E8DD] p-3.5">
            <div className="mt-0.5 shrink-0 bg-[#B66549] p-1 text-white">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-800 font-mono uppercase tracking-wider">
                Impact Milestone
              </p>
              <p className="text-sm text-gray-700 mt-0.5">{ngo.impactSummary}</p>
            </div>
          </div>
        </div>

        {/* Requirements and active opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Opportunities */}
          <div className="space-y-3 border-t border-[#D6CEBD] bg-[#F5F2E9] p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 font-mono">
                {ngo.isDraft ? 'Suggested Roles · Confirm Availability' : 'Active Roles'}
            </h4>
            <div className="space-y-2">
              {ngo.activeOpportunities.map((opportunity, oIdx) => (
                <div
                  key={oIdx}
                  className="flex items-center gap-2.5 bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 font-medium hover:border-indigo-300 transition-colors cursor-pointer"
                  onClick={() => setSelectedOpportunity(opportunity)}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 transition-all ${selectedOpportunity === opportunity ? 'bg-indigo-600 scale-125' : 'bg-gray-300'}`} />
                  <span className={selectedOpportunity === opportunity ? 'text-indigo-900 font-semibold' : ''}>
                    {opportunity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-3 border-t border-[#D6CEBD] bg-[#F5F2E9] p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-rose-600 font-mono">
              Requirements
            </h4>
            <div className="space-y-2">
              {ngo.requirements.map((req, rIdx) => (
                <div key={rIdx} className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact info row */}
        {ngo.isDraft && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            This is a suggested profile. Confirm its current locations, open roles, and contact details with the organization before applying.
          </div>
        )}

        <div className="flex flex-col items-stretch justify-between gap-3 border-y border-[#D6CEBD] bg-[#EAE5D9]/60 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider font-mono">
                {ngo.contactEmail ? 'Direct Inquiry Mail' : 'Organization Website'}
              </p>
              <p className="text-sm font-semibold text-gray-800 break-all">
                {ngo.contactEmail || ngo.websiteUrl || 'Contact details not provided'}
              </p>
            </div>
          </div>
          {ngo.contactEmail && (
            <button
              onClick={handleCopyEmail}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedEmail ? 'Copied' : 'Copy Email'}
            </button>
          )}
        </div>

        {/* Custom application generator assistant */}
        <div className="space-y-4 border-y border-[#D6CEBD] bg-[#F5F2E9] p-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800">Application Pitch Assistant</h4>
              <p className="text-xs text-gray-500">Draft a tailored expression of interest to apply instantly</p>
            </div>
          </div>

          <form onSubmit={handleGeneratePitch} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 font-mono">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 font-mono">
                  Opportunity Role
                </label>
                <select
                  value={selectedOpportunity}
                  onChange={(e) => setSelectedOpportunity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none h-[34px] cursor-pointer"
                >
                  {ngo.activeOpportunities.map((o, idx) => (
                    <option key={idx} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 font-mono">
                Your Core Skills
              </label>
              <input
                type="text"
                placeholder="e.g. Nursing, Social Media, Web Development, Translating"
                value={userSkills}
                onChange={(e) => setUserSkills(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 font-mono">
                Why are you motivated? (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Briefly share why you wish to volunteer, or keep the default personalized statement."
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="w-full p-3 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Generate Pitch Letter
            </button>
          </form>

          {/* Render generated letter output */}
          <AnimatePresence>
            {generatedLetter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-xs font-bold text-gray-800 font-mono flex items-center gap-1">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Draft Pitch Letter
                  </span>
                  <button
                    onClick={handleCopyLetter}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied Pitch' : 'Copy Pitch'}
                  </button>
                </div>
                <pre className="p-4 rounded-lg border border-gray-200 bg-white text-[11px] leading-relaxed text-gray-600 whitespace-pre-wrap font-mono h-48 overflow-y-auto">
                  {generatedLetter}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Persistent Footer Action Panel with Apply and Website Redirections */}
      <div className="flex flex-col gap-3 border-t border-[#D6CEBD] bg-[#EAE5D9]/60 p-5 sm:flex-row">
        <a
          href={ngo.websiteUrl}
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-2 border border-[#788365] bg-transparent px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-[#EAE5D9] cursor-pointer"
        >
          Visit Official Website
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </a>
        <a
          href={ngo.applyUrl}
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-2 bg-[#244C3B] px-5 py-3 text-sm font-semibold text-[#FBF9F3] transition-colors hover:bg-[#193429] cursor-pointer"
        >
          {ngo.isDraft ? 'Check Volunteer Page' : 'Apply to Volunteer Now'}
          <ArrowUpRight className="w-4.5 h-4.5" />
        </a>
      </div>
    </div>
  );
}

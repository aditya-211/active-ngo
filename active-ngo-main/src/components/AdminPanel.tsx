import { FormEvent, useEffect, useState } from 'react';
import { CAUSES } from '../data';
import { NGO_QUICK_START_PROFILES } from '../adminTemplates';
import { Cause, NGO, Scope } from '../types';
import {
  ArrowLeft,
  Building2,
  Check,
  CircleAlert,
  LockKeyhole,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';

const ADMIN_PASSWORD_KEY = 'samarpan-archive-admin-password-v1';
const PASSWORD_ITERATIONS = 310_000;
const PASSWORD_ALGORITHM = 'PBKDF2-SHA-256';

type NGOFormValues = Omit<NGO, 'activeOpportunities' | 'requirements'> & {
  activeOpportunitiesText: string;
  requirementsText: string;
};

interface AdminPanelProps {
  ngos: NGO[];
  storageError: string | null;
  onSave: (ngos: NGO[]) => void;
  onClose: () => void;
}

function emptyForm(): NGOFormValues {
  return {
    id: '',
    name: '',
    cause: CAUSES[0],
    description: '',
    extendedDescription: '',
    impactSummary: '',
    founded: new Date().getFullYear(),
    headquarters: '',
    activeLocation: '',
    scope: 'National',
    websiteUrl: '',
    applyUrl: '',
    activeOpportunitiesText: '',
    requirementsText: '',
    rating: '',
    contactEmail: '',
    isDraft: false,
  };
}

function toFormValues(ngo: NGO): NGOFormValues {
  const { activeOpportunities, requirements, ...details } = ngo;
  return {
    ...details,
    activeOpportunitiesText: activeOpportunities.join('\n'),
    requirementsText: requirements.join('\n'),
  };
}

function toNGO(values: NGOFormValues): NGO {
  const { activeOpportunitiesText, requirementsText, ...details } = values;
  return {
    ...details,
    name: details.name.trim(),
    description: details.description.trim(),
    extendedDescription: details.extendedDescription.trim(),
    impactSummary: details.impactSummary.trim(),
    headquarters: details.headquarters.trim(),
    activeLocation: details.activeLocation.trim(),
    websiteUrl: details.websiteUrl.trim(),
    applyUrl: details.applyUrl.trim(),
    contactEmail: details.contactEmail.trim(),
    rating: details.rating.trim(),
    activeOpportunities: activeOpportunitiesText.split('\n').map((item) => item.trim()).filter(Boolean),
    requirements: requirementsText.split('\n').map((item) => item.trim()).filter(Boolean),
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function hashPassword(password: string, salt: string, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(salt),
      iterations,
      hash: 'SHA-256',
    },
    key,
    256
  );
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function createSalt(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

interface PasswordRecord {
  salt: string;
  hash: string;
  algorithm: string;
  iterations: number;
}

function isPasswordRecord(value: unknown): value is PasswordRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.salt === 'string' &&
    typeof record.hash === 'string' &&
    record.algorithm === PASSWORD_ALGORITHM &&
    typeof record.iterations === 'number' &&
    record.iterations >= 100_000 &&
    record.iterations <= 1_000_000
  );
}

const inputClass =
  'w-full border border-[#D6CEBD] bg-[#FBF9F3] px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#244C3B] focus:ring-2 focus:ring-[#244C3B]/10';
const labelClass = 'mb-1.5 block text-xs font-medium text-gray-600';

export function AdminPanel({ ngos, storageError, onSave, onClose }: AdminPanelProps) {
  const [authState, setAuthState] = useState<'loading' | 'setup' | 'locked' | 'unlocked'>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [form, setForm] = useState<NGOFormValues>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);
  const [deletedName, setDeletedName] = useState('');
  const availableQuickStartProfiles = NGO_QUICK_START_PROFILES.filter(
    (profile) => !ngos.some((ngo) => ngo.name.toLowerCase() === profile.name.toLowerCase())
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_PASSWORD_KEY);
      if (!stored) {
        setAuthState('setup');
        return;
      }
      if (!isPasswordRecord(JSON.parse(stored))) {
        setAuthError('The saved admin password could not be read. Clear this browser’s saved admin password to set up access again.');
        setAuthState('locked');
        return;
      }
      setAuthState('locked');
    } catch {
      setAuthError('Admin access settings could not be read from this browser.');
      setAuthState('locked');
    }
  }, []);

  const handleAuthentication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      if (authState === 'setup') {
        if (password.length < 8) {
          setAuthError('Choose a password with at least 8 characters.');
          return;
        }
        if (password !== confirmPassword) {
          setAuthError('The passwords do not match.');
          return;
        }

        const salt = createSalt();
        const record = {
          salt,
          hash: await hashPassword(password, salt, PASSWORD_ITERATIONS),
          algorithm: PASSWORD_ALGORITHM,
          iterations: PASSWORD_ITERATIONS,
        };
        localStorage.setItem(ADMIN_PASSWORD_KEY, JSON.stringify(record));
        setAuthState('unlocked');
        setPassword('');
        setConfirmPassword('');
        return;
      }

      const stored: unknown = JSON.parse(localStorage.getItem(ADMIN_PASSWORD_KEY) || 'null');
      if (!isPasswordRecord(stored)) {
        setAuthError('Admin access settings are missing or invalid. Clear this browser’s saved admin password to set up access again.');
        return;
      }
      if ((await hashPassword(password, stored.salt, stored.iterations)) !== stored.hash) {
        setAuthError('That password did not match. Please try again.');
        return;
      }
      setAuthState('unlocked');
      setPassword('');
    } catch {
      setAuthError('Could not verify the password in this browser. Try a current browser over localhost or HTTPS.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const startNewNGO = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError('');
    setSaved(false);
    setDeletedName('');
  };

  const useQuickStartProfile = (profile: NGO) => {
    setEditingId(null);
    setForm(toFormValues(profile));
    setFormError('');
    setSaved(false);
    setDeletedName('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditing = (ngo: NGO) => {
    setEditingId(ngo.id);
    setForm(toFormValues(ngo));
    setFormError('');
    setSaved(false);
    setDeletedName('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteNGO = (ngo: NGO) => {
    if (!window.confirm(`Delete ${ngo.name} from this browser's directory? This cannot be undone.`)) {
      return;
    }

    onSave(ngos.filter((record) => record.id !== ngo.id));
    if (editingId === ngo.id) {
      setEditingId(null);
      setForm(emptyForm());
    }
    setFormError('');
    setSaved(false);
    setDeletedName(ngo.name);
  };

  const handleSaveNGO = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const details = toNGO(form);
    if (editingId === null && !details.activeOpportunities.length) {
      setFormError('Add at least one active role before saving.');
      return;
    }

    if (editingId) {
      onSave(ngos.map((ngo) => (ngo.id === editingId ? { ...details, id: editingId } : ngo)));
    } else {
      const baseId = slugify(details.name) || 'organization';
      let id = baseId;
      let suffix = 2;
      while (ngos.some((ngo) => ngo.id === id)) {
        id = `${baseId}-${suffix++}`;
      }
      onSave([...ngos, { ...details, id }]);
    }
    setEditingId(null);
    setForm(emptyForm());
    setSaved(true);
    setDeletedName('');
  };

  if (authState !== 'unlocked') {
    const isSetup = authState === 'setup';
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <section className="w-full max-w-md border border-[#D6CEBD] bg-[#FBF9F3] p-7 sm:p-9">
          <button
            onClick={onClose}
            className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to directory
          </button>
          <div className="mb-5 flex h-12 w-12 items-center justify-center border border-[#D6CEBD] bg-[#EAE5D9] text-indigo-700">
            {isSetup ? <ShieldCheck className="h-6 w-6" /> : <LockKeyhole className="h-6 w-6" />}
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
            {isSetup ? 'First-time setup' : 'Admin access'}
          </p>
          <h2 className="font-serif text-3xl text-gray-900">
            {authState === 'loading' ? 'Opening admin' : isSetup ? 'Set your admin password' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {isSetup
              ? 'Create a password to unlock the organization editor on this browser.'
              : 'Enter the password set for this browser to manage organizations.'}
          </p>

          {authState === 'loading' ? (
            <div className="mt-8 h-10 animate-pulse rounded-xl bg-gray-100" />
          ) : (
            <form className="mt-7 space-y-4" onSubmit={handleAuthentication}>
              <div>
                <label className={labelClass} htmlFor="admin-password">
                  {isSetup ? 'Create password' : 'Password'}
                </label>
                <input
                  id="admin-password"
                  className={inputClass}
                  type="password"
                  autoComplete={isSetup ? 'new-password' : 'current-password'}
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              {isSetup && (
                <div>
                  <label className={labelClass} htmlFor="confirm-admin-password">Confirm password</label>
                  <input
                    id="confirm-admin-password"
                    className={inputClass}
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
              )}
              {authError && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {authError}
                </p>
              )}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="flex w-full items-center justify-center gap-2 bg-[#244C3B] px-4 py-3 text-sm font-semibold text-[#FBF9F3] transition hover:bg-[#193429] disabled:cursor-wait disabled:opacity-70"
              >
                <LockKeyhole className="h-4 w-4" />
                {isAuthenticating ? 'Please wait…' : isSetup ? 'Set password & continue' : 'Unlock admin'}
              </button>
            </form>
          )}

          <p className="mt-6 border-l-2 border-[#788365] bg-[#EAE5D9]/70 px-4 py-3 text-xs leading-5 text-gray-500">
            This is a browser-only access lock, not secure authentication. Your admin password and directory data are stored in this browser and are not shared with other devices.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
            <ShieldCheck className="h-4 w-4" /> Local admin
          </p>
          <h2 className="font-serif text-3xl text-gray-900 sm:text-4xl">Manage the directory</h2>
          <p className="mt-2 text-sm text-gray-500">
            Add organizations and keep active locations, roles, and requirements up to date.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={startNewNGO}
            className="inline-flex items-center justify-center gap-2 bg-[#244C3B] px-4 py-2.5 text-sm font-semibold text-[#FBF9F3] transition hover:bg-[#193429]"
          >
            <Plus className="h-4 w-4" /> Add organization
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 border border-[#D6CEBD] bg-transparent px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-[#EAE5D9]"
          >
            <ArrowLeft className="h-4 w-4" /> Directory
          </button>
        </div>
      </div>

      {storageError && (
        <div role="alert" className="mb-6 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {storageError}
        </div>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)]">
        <section className="border-y border-[#D6CEBD] bg-[#FBF9F3]/75 p-5 sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
                {editingId ? 'Edit organization' : form.isDraft ? 'Quick-start profile' : 'Organization details'}
              </p>
              <h3 className="mt-1 font-serif text-2xl text-gray-900">
                {editingId || form.name ? form.name : 'Add a new organization'}
              </h3>
            </div>
            {editingId && (
              <button
                onClick={startNewNGO}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Cancel editing"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {!editingId && availableQuickStartProfiles.length > 0 && (
            <div className="mb-6 border-y border-[#D6CEBD] bg-[#EAE5D9]/55 p-4 sm:p-5">
              <div className="mb-3 flex items-start gap-2.5">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Quick-start profiles</h4>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Choose a pre-filled organization profile to avoid entering everything by hand. Suggested roles and locations need confirmation before listing them as active.
                  </p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {availableQuickStartProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => useQuickStartProfile(profile)}
                    className="flex items-center justify-between gap-3 border border-[#D6CEBD] bg-[#FBF9F3] px-3.5 py-3 text-left transition hover:border-[#788365] hover:bg-[#F3EFE5]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-gray-800">{profile.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-gray-500">{profile.cause}</span>
                    </span>
                    <Plus className="h-4 w-4 shrink-0 text-indigo-600" />
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-5 text-gray-500">
                Quick-start profiles are saved as drafts. Confirm current openings and details with each organization before marking them active.
              </p>
            </div>
          )}

          <form onSubmit={handleSaveNGO} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="ngo-name">Organization name *</label>
                <input id="ngo-name" className={inputClass} required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </div>
              <div>
                <label className={labelClass} htmlFor="ngo-cause">Cause *</label>
                <select id="ngo-cause" className={inputClass} value={form.cause} onChange={(event) => setForm({ ...form, cause: event.target.value as Cause })}>
                  {CAUSES.map((cause) => <option key={cause} value={cause}>{cause}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="ngo-scope">Operating scope *</label>
                <select id="ngo-scope" className={inputClass} value={form.scope} onChange={(event) => setForm({ ...form, scope: event.target.value as Scope })}>
                  <option value="National">National</option>
                  <option value="Regional">Regional / State</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="ngo-description">Short description *</label>
                <textarea id="ngo-description" className={inputClass} rows={2} required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="ngo-extended-description">About the organization</label>
                <textarea id="ngo-extended-description" className={inputClass} rows={3} value={form.extendedDescription} onChange={(event) => setForm({ ...form, extendedDescription: event.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="ngo-impact">Impact milestone</label>
                <textarea id="ngo-impact" className={inputClass} rows={2} value={form.impactSummary} onChange={(event) => setForm({ ...form, impactSummary: event.target.value })} />
              </div>
              <div>
                <label className={labelClass} htmlFor="ngo-founded">Year founded *</label>
                <input id="ngo-founded" className={inputClass} type="number" min="1800" max={new Date().getFullYear()} required value={form.founded} onChange={(event) => setForm({ ...form, founded: Number(event.target.value) })} />
              </div>
              <div>
                <label className={labelClass} htmlFor="ngo-rating">Rating</label>
                <input id="ngo-rating" className={inputClass} placeholder="e.g. 92/100 (leave blank if unrated)" value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="ngo-hq">Headquarters *</label>
                <input id="ngo-hq" className={inputClass} required value={form.headquarters} onChange={(event) => setForm({ ...form, headquarters: event.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="ngo-active-location">Active regions / locations *</label>
                <input id="ngo-active-location" className={inputClass} required value={form.activeLocation} onChange={(event) => setForm({ ...form, activeLocation: event.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="ngo-opportunities">Active roles (one per line) *</label>
                <textarea id="ngo-opportunities" className={inputClass} rows={4} required value={form.activeOpportunitiesText} onChange={(event) => setForm({ ...form, activeOpportunitiesText: event.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="ngo-requirements">Volunteer requirements (one per line)</label>
                <textarea id="ngo-requirements" className={inputClass} rows={3} value={form.requirementsText} onChange={(event) => setForm({ ...form, requirementsText: event.target.value })} />
              </div>
              <div>
                <label className={labelClass} htmlFor="ngo-email">Contact email</label>
                <input id="ngo-email" className={inputClass} type="email" value={form.contactEmail} onChange={(event) => setForm({ ...form, contactEmail: event.target.value })} />
              </div>
              <div>
                <label className={labelClass} htmlFor="ngo-website">Website URL</label>
                <input id="ngo-website" className={inputClass} type="url" placeholder="https://" value={form.websiteUrl} onChange={(event) => setForm({ ...form, websiteUrl: event.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="ngo-apply-url">Volunteer application URL</label>
                <input id="ngo-apply-url" className={inputClass} type="url" placeholder="https://" value={form.applyUrl} onChange={(event) => setForm({ ...form, applyUrl: event.target.value })} />
              </div>
              <label className="sm:col-span-2 flex cursor-pointer items-start gap-3 rounded-xl border border-[#e1e5dc] bg-[#fbfcf9] p-3.5">
                <input
                  type="checkbox"
                  checked={!form.isDraft}
                  onChange={(event) => setForm({ ...form, isDraft: !event.target.checked })}
                  className="mt-0.5 h-4 w-4 accent-[#315b43]"
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-700">Mark as active in the public directory</span>
                  <span className="mt-0.5 block text-xs leading-5 text-gray-500">
                    Only enable this after confirming the organization details and current volunteer openings.
                  </span>
                </span>
              </label>
            </div>

            {formError && <p role="alert" className="text-sm text-rose-700">{formError}</p>}
            {saved && !storageError && (
              <p role="status" className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <Check className="h-4 w-4" /> Organization saved in this browser.
              </p>
            )}
            {deletedName && !storageError && (
              <p role="status" className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <Check className="h-4 w-4" /> {deletedName} deleted from this browser.
              </p>
            )}
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 bg-[#244C3B] px-4 py-3 text-sm font-semibold text-[#FBF9F3] transition hover:bg-[#193429]">
              <Save className="h-4 w-4" /> {editingId ? 'Save changes' : 'Add organization'}
            </button>
          </form>
        </section>

        <section className="border-y border-[#D6CEBD] bg-[#FBF9F3]/75 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">Directory records</p>
              <h3 className="mt-1 font-serif text-2xl text-gray-900">{ngos.length} organizations</h3>
            </div>
            <Building2 className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
            {ngos.map((ngo) => (
              <article key={ngo.id} className="flex items-center justify-between gap-3 border-b border-[#D6CEBD] px-2 py-3 first:border-t">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-gray-800">{ngo.name}</h4>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {ngo.isDraft ? 'Draft profile · verify roles' : `${ngo.activeOpportunities.length} active ${ngo.activeOpportunities.length === 1 ? 'role' : 'roles'}`} · {ngo.activeLocation || 'No regions listed'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => startEditing(ngo)}
                    className="border border-[#788365] bg-transparent px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-[#EAE5D9]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNGO(ngo)}
                    aria-label={`Delete ${ngo.name}`}
                    title={`Delete ${ngo.name}`}
                    className="inline-flex items-center justify-center gap-1.5 border border-[#B66549]/50 bg-transparent px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-[#B66549] hover:bg-[#F1E4DC] focus-visible:outline-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-gray-400">
            Changes are saved only in this browser and will not sync to other devices.
          </p>
        </section>
      </div>
    </main>
  );
}

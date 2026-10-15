import { ALL_NGO_DATA } from './data';
import { NGO } from './types';

const NGO_STORAGE_KEY = 'samarpan-archive-ngos-v1';

interface StoredNGOState {
  ngos: NGO[];
  error: string | null;
}

function isNGO(value: unknown): value is NGO {
  if (!value || typeof value !== 'object') return false;

  const ngo = value as Record<string, unknown>;
  return (
    typeof ngo.id === 'string' &&
    typeof ngo.name === 'string' &&
    typeof ngo.cause === 'string' &&
    typeof ngo.description === 'string' &&
    typeof ngo.extendedDescription === 'string' &&
    typeof ngo.impactSummary === 'string' &&
    typeof ngo.founded === 'number' &&
    typeof ngo.headquarters === 'string' &&
    typeof ngo.activeLocation === 'string' &&
    (ngo.scope === 'National' || ngo.scope === 'Regional') &&
    typeof ngo.websiteUrl === 'string' &&
    typeof ngo.applyUrl === 'string' &&
    Array.isArray(ngo.activeOpportunities) &&
    ngo.activeOpportunities.every((item) => typeof item === 'string') &&
    Array.isArray(ngo.requirements) &&
    ngo.requirements.every((item) => typeof item === 'string') &&
    typeof ngo.rating === 'string' &&
    typeof ngo.contactEmail === 'string' &&
    (ngo.isDraft === undefined || typeof ngo.isDraft === 'boolean')
  );
}

export function loadNGOsFromStorage(): StoredNGOState {
  try {
    const stored = localStorage.getItem(NGO_STORAGE_KEY);
    if (!stored) return { ngos: ALL_NGO_DATA, error: null };

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every(isNGO)) {
      return {
        ngos: ALL_NGO_DATA,
        error: 'Saved organization data is invalid. The original directory is shown instead.',
      };
    }

    return { ngos: parsed, error: null };
  } catch {
    return {
      ngos: ALL_NGO_DATA,
      error: 'Saved organization data could not be read. The original directory is shown instead.',
    };
  }
}

export function saveNGOsToStorage(ngos: NGO[]): void {
  localStorage.setItem(NGO_STORAGE_KEY, JSON.stringify(ngos));
}

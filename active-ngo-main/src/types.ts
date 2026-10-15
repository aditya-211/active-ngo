export type Cause =
  | 'Education & Tech'
  | 'Healthcare & Medicine'
  | 'Environment & Conservation'
  | 'Disaster & Crisis Relief'
  | 'Hunger & Nutrition'
  | 'Water & Sanitation';

export type Scope = 'National' | 'Regional';

export interface NGO {
  id: string;
  name: string;
  cause: Cause;
  description: string;
  extendedDescription: string;
  impactSummary: string;
  founded: number;
  headquarters: string;
  activeLocation: string;
  scope: Scope;
  websiteUrl: string;
  applyUrl: string;
  activeOpportunities: string[];
  requirements: string[];
  rating: string;
  contactEmail: string;
  isDraft?: boolean;
}

export type SortBy = 'name' | 'founded' | 'rating';

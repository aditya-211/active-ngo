import { NGO } from './types';

const profileNote =
  'Suggested starter profile for the directory. Confirm current program locations and volunteer openings directly with the organization before publishing it as active.';

export const NGO_QUICK_START_PROFILES: NGO[] = [
  {
    id: 'teach-for-india',
    name: 'Teach For India',
    cause: 'Education & Tech',
    description:
      'Works toward educational equity by supporting students and communities through classroom teaching and leadership development.',
    extendedDescription: `Teach For India works to ensure that all children have access to an excellent education. ${profileNote}`,
    impactSummary: 'Suggested milestone: supporting students through classroom and community education programs.',
    founded: 2008,
    headquarters: 'Mumbai, Maharashtra',
    activeLocation: 'Multiple Indian cities (confirm current program locations)',
    scope: 'National',
    websiteUrl: 'https://www.teachforindia.org',
    applyUrl: 'https://www.teachforindia.org/fellowship',
    activeOpportunities: [
      'Suggested: Classroom learning support (confirm availability)',
      'Suggested: Student mentoring (confirm availability)',
      'Suggested: Community outreach (confirm availability)',
    ],
    requirements: [
      'Suggested: Interest in education and student development',
      'Suggested: Consistent availability and communication skills',
      'Confirm role-specific requirements with the organization',
    ],
    rating: '',
    contactEmail: '',
    isDraft: true,
  },
  {
    id: 'helpage-india',
    name: 'HelpAge India',
    cause: 'Healthcare & Medicine',
    description:
      'Supports older people in India through healthcare access, elder care, and programs that promote dignity and wellbeing.',
    extendedDescription: `HelpAge India works with older people and communities on health, care, and social support. ${profileNote}`,
    impactSummary: 'Suggested milestone: improving access to care and support for older people.',
    founded: 1978,
    headquarters: 'New Delhi, Delhi',
    activeLocation: 'Pan-India (confirm current program locations)',
    scope: 'National',
    websiteUrl: 'https://www.helpageindia.org',
    applyUrl: 'https://www.helpageindia.org/get-involved/',
    activeOpportunities: [
      'Suggested: Senior wellness outreach (confirm availability)',
      'Suggested: Community health camp support (confirm availability)',
      'Suggested: Elder companionship (confirm availability)',
    ],
    requirements: [
      'Suggested: Patient, respectful communication with older adults',
      'Suggested: Interest in community health and elder care',
      'Confirm role-specific requirements with the organization',
    ],
    rating: '',
    contactEmail: '',
    isDraft: true,
  },
  {
    id: 'wwf-india',
    name: 'WWF-India',
    cause: 'Environment & Conservation',
    description:
      'Works on wildlife conservation, habitat protection, and environmental awareness across India.',
    extendedDescription: `WWF-India works with communities and partners on nature conservation and environmental education. ${profileNote}`,
    impactSummary: 'Suggested milestone: advancing wildlife and habitat conservation in India.',
    founded: 1969,
    headquarters: 'New Delhi, Delhi',
    activeLocation: 'Multiple Indian landscapes (confirm current program locations)',
    scope: 'National',
    websiteUrl: 'https://www.wwfindia.org',
    applyUrl: 'https://www.wwfindia.org/about_wwf/volunteers/',
    activeOpportunities: [
      'Suggested: Conservation awareness support (confirm availability)',
      'Suggested: Community outreach (confirm availability)',
      'Suggested: Environmental education (confirm availability)',
    ],
    requirements: [
      'Suggested: Interest in wildlife and environmental conservation',
      'Suggested: Clear communication and teamwork',
      'Confirm role-specific requirements with the organization',
    ],
    rating: '',
    contactEmail: '',
    isDraft: true,
  },
  {
    id: 'bhumi',
    name: 'Bhumi',
    cause: 'Education & Tech',
    description:
      'Engages volunteers in education and community development initiatives for children and young people.',
    extendedDescription: `Bhumi connects volunteers with education and community initiatives for children. ${profileNote}`,
    impactSummary: 'Suggested milestone: engaging volunteers in education and community development.',
    founded: 2006,
    headquarters: 'Chennai, Tamil Nadu',
    activeLocation: 'Multiple Indian cities (confirm current program locations)',
    scope: 'National',
    websiteUrl: 'https://www.bhumi.ngo',
    applyUrl: 'https://www.bhumi.ngo/volunteer',
    activeOpportunities: [
      'Suggested: After-school learning support (confirm availability)',
      'Suggested: Youth mentorship (confirm availability)',
      'Suggested: Community event support (confirm availability)',
    ],
    requirements: [
      'Suggested: Interest in working with children and young people',
      'Suggested: Reliable time commitment and teamwork',
      'Confirm role-specific requirements with the organization',
    ],
    rating: '',
    contactEmail: '',
    isDraft: true,
  },
];

export const DIMENSIONS = [
  {
    code: 'LS',
    name: 'Leadership & Standards',
    description: 'Ability to guide and uphold quality.',
    color: '#2563eb',
    accent: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    code: 'CC',
    name: 'Care & Collaboration',
    description: 'Interpersonal sensitivity and teamwork.',
    color: '#059669',
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    code: 'AT',
    name: 'Analytical Thinking',
    description: 'Rational decision-making and problem solving.',
    color: '#7c3aed',
    accent: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    code: 'AR',
    name: 'Adaptability & Responsibility',
    description: 'Flexibility, accountability, and resilience.',
    color: '#d97706',
    accent: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    code: 'II',
    name: 'Innovation & Initiative',
    description: 'Creativity, curiosity, and proactive behaviour.',
    color: '#dc2626',
    accent: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];

export const RESPONSE_SCALE = [
  { score: 0, label: 'Never', description: 'Rarely or not at all true of me' },
  { score: 1, label: 'Rarely', description: 'True of me occasionally' },
  { score: 2, label: 'Often', description: 'True of me most of the time' },
  { score: 3, label: 'Almost Always', description: 'Consistently true of me' },
];

export const INTERPRETATIONS = {
  Developing: {
    label: 'Developing',
    range: '0–8',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    description:
      'This dimension represents an area where further development may be beneficial. Opportunities for practice, mentoring, and reflection may help strengthen this behavioural tendency.',
  },
  'Moderately Demonstrated': {
    label: 'Moderately Demonstrated',
    range: '9–16',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    description:
      'This dimension is moderately demonstrated. Continued practice and experience can help strengthen and apply this behavioural tendency across different situations.',
  },
  'Strongly Demonstrated': {
    label: 'Strongly Demonstrated',
    range: '17–24',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description:
      'This dimension is strongly demonstrated. This behavioural tendency may be a useful strength in academic and professional settings.',
  },
};

export const DEPARTMENTS = [
  'Computer Science',
  'Commerce & Management',
  'Humanities & Social Sciences',
  'Science',
  'Psychology',
  'Business Administration',
];

export const PROGRAMMES = [
  'BCA',
  'B.Com',
  'BBA',
  'BA Psychology',
  'B.Sc',
  'MCA',
  'M.Com',
  'MBA',
  'Faculty / Staff',
];

export const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'N/A (Faculty)'];

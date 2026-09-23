export interface MembershipPlan {
  id: string;
  name: string;
  duration: string;
  durationMonths: number;
  price: number;
  priceDisplay: string;
  frequency: string;
  effectiveRate: string | null;
  isBestValue: boolean;
  description: string;
  features: string[];
  seats?: string;
}

export interface MembershipCategory {
  id: string; // 'individual' | 'corporate'
  title: string;
  tagline: string;
  description: string;
  plans: MembershipPlan[];
}

export const MEMBERSHIP_CATEGORIES: MembershipCategory[] = [
  {
    id: 'individual',
    title: 'Individual Membership',
    tagline: 'Personal Professional Education & Compliance Certification',
    description: 'Designed for healthcare practitioners, practice managers, compliance officers, and medical billers who require ongoing CEU training and regulatory updates.',
    plans: [
      {
        id: 'ind-1m',
        name: '1 Month Membership',
        duration: '1 Month',
        durationMonths: 1,
        price: 199,
        priceDisplay: '$199',
        frequency: '/ month',
        effectiveRate: null,
        isBestValue: false,
        description: 'Flexible short-term compliance training access for individual professionals.',
        features: [
          'Access to scheduled live interactive webinars during active month',
          'Unlimited access to on-demand recorded webinar library',
          'Downloadable slide decks and reference handouts',
          'Official certificate of completion for attended sessions',
          'Standard customer & technical support',
        ],
      },
      {
        id: 'ind-6m',
        name: '6 Months Membership',
        duration: '6 Months',
        durationMonths: 6,
        price: 899,
        priceDisplay: '$899',
        frequency: '/ 6 months',
        effectiveRate: '$150/month when billed semi-annually',
        isBestValue: false,
        description: 'Extended compliance training access for ongoing professional education.',
        features: [
          'Access to all live interactive webinars during 6-month period',
          'Unlimited access to on-demand recorded webinar library',
          'Downloadable slide decks and compliance reference materials',
          'Certificates of completion for all completed courses',
          'Member-only regulatory updates & guidance documents',
          'Standard customer & technical support',
        ],
      },
      {
        id: 'ind-1y',
        name: '1 Year Membership',
        duration: '1 Year',
        durationMonths: 12,
        price: 1499,
        priceDisplay: '$1,499',
        frequency: '/ year',
        effectiveRate: '$125/month when billed annually',
        isBestValue: true,
        description: 'Comprehensive year-round compliance training and resource access.',
        features: [
          'Full access to all scheduled live interactive webinars for 12 months',
          '24/7 unlimited access to complete on-demand recording library',
          'Complete training materials, checklists & slide decks',
          'Verified CEU & attendance certificates for all sessions',
          'Priority regulatory updates and compliance newsletters',
          'Priority customer & coordinator support',
        ],
      },
    ],
  },
  {
    id: 'corporate',
    title: 'Corporate Membership',
    tagline: 'Organization-Wide Healthcare Compliance & Staff Training Solutions',
    description: 'Custom training packages designed for healthcare systems, hospitals, multi-specialty clinics, and business associates requiring scalable staff certification.',
    plans: [
      {
        id: 'corp-1m',
        name: '1 Month Corporate',
        duration: '1 Month',
        durationMonths: 1,
        price: 499,
        priceDisplay: '$499',
        frequency: '/ month',
        effectiveRate: null,
        isBestValue: false,
        seats: 'Up to 5 team members',
        description: 'Flexible short-term compliance training access for healthcare teams and clinics.',
        features: [
          'Team access for up to 5 users from your organization',
          'Access to live interactive webinars for registered team members',
          'Unlimited access to on-demand recorded webinar library',
          'Downloadable training handouts & presentation decks',
          'Individual certificates of completion for each attendee',
          'Dedicated team coordination support',
        ],
      },
      {
        id: 'corp-6m',
        name: '6 Months Corporate',
        duration: '6 Months',
        durationMonths: 6,
        price: 2399,
        priceDisplay: '$2,399',
        frequency: '/ 6 months',
        effectiveRate: '$400/month when billed semi-annually',
        isBestValue: false,
        seats: 'Up to 10 team members',
        description: 'Multi-user compliance training package for mid-size practices and clinical groups.',
        features: [
          'Team access for up to 10 registered team members',
          'Full access to all scheduled live interactive webinars',
          '24/7 access to complete on-demand webinar library',
          'Administrative dashboard with attendance & completion tracking',
          'Official certificates of completion for all participating staff',
          'Custom billing and centralized invoicing',
        ],
      },
      {
        id: 'corp-1y',
        name: '1 Year Corporate Enterprise',
        duration: '1 Year',
        durationMonths: 12,
        price: 4299,
        priceDisplay: '$4,299',
        frequency: '/ year',
        effectiveRate: '$358/month when billed annually',
        isBestValue: true,
        seats: 'Up to 25 team members',
        description: 'Comprehensive enterprise compliance solution for large organizations.',
        features: [
          'Organization-wide access for up to 25 registered team members',
          'Unlimited access to all live and on-demand webinars for 12 months',
          'Dedicated enterprise account coordinator & compliance advisor',
          'Customized webinar recommendations & compliance roadmaps',
          'Automated group certificate issuance and LMS integration support',
          'Priority support and custom invoicing with Net-30 payment terms',
        ],
      },
    ],
  },
];

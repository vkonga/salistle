import type { Plan } from '@/types';

export const plans: Plan[] = [
  {
    id: 'plan_creator',
    name: 'Creator',
    price: 199,
    description: 'Perfect for getting started and bringing your first few stories to life.',
    features: [
      'Generate up to 5 stories per month',
      'Access to all illustration styles',
      'Standard story generation speed',
      'Community support',
    ],
    monthlyStoryLimit: 5,
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    price: 599,
    description: 'For prolific storytellers who want to unleash their full creative potential.',
    features: [
      'Generate up to 15 stories per month',
      'Access to all illustration styles',
      'Priority story generation',
      'Email support',
    ],
    monthlyStoryLimit: 15,
  },
];

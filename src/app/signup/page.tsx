import type { Metadata } from 'next';
import SignupView from './signup-view';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new SalistleAI account to start generating magical AI storybooks for children.',
};

export default function SignupPage() {
  return <SignupView />;
}

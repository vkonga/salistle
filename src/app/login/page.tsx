import type { Metadata } from 'next';
import LoginView from './login-view';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your SalistleAI account to create and view your magical AI-generated stories.',
};

export default function LoginPage() {
  return <LoginView />;
}

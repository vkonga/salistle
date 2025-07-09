import type { Metadata } from 'next';
import TermsAndConditionsView from './terms-and-conditions-view';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Read the terms, conditions, and privacy policy for using the SalistleAI AI story generator service.',
};

export default function TermsAndConditionsPage() {
    return <TermsAndConditionsView />;
}

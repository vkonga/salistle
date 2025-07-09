import type { Metadata } from 'next';
import ContactView from './contact-view';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Have a question or feedback? Reach out to the SalistleAI team. We would love to hear from you.',
};

export default function ContactPage() {
  return <ContactView />;
}

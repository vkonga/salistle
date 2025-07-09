import type { Metadata } from 'next';
import StoriesView from './stories-view';

export const metadata: Metadata = {
  title: 'My Stories',
  description: 'Browse, read, and manage all the magical stories you have created with SalistleAI.',
};

export default function StoriesPage() {
    return <StoriesView />;
}

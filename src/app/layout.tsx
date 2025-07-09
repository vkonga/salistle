import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';
import { Alegreya } from 'next/font/google';
import { cn } from '@/lib/utils';

const alegreya = Alegreya({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    template: '%s | SalistleAI',
    default: 'SalistleAI | AI Story Generator for Children',
  },
  description: "Transform simple ideas into beautifully illustrated children's books using the power of AI. Perfect for parents, teachers, and young storytellers.",
  icons: {
    icon: 'https://res.cloudinary.com/dsukslmgr/image/upload/v1752064727/ChatGPT_Image_Jul_9_2025_12_14_27_PM_l3fkk1.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full font-sans", alegreya.variable)}>
      <body className="antialiased h-full">
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

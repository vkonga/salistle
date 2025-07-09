
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function TermsAndConditionsView() {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // This runs only on the client, avoiding hydration mismatches.
    setLastUpdated(new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <div className="relative flex items-center justify-between mb-8">
          <div className="absolute left-0">
            <Button asChild variant="ghost">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          <div className="flex-1 flex justify-center items-center gap-2">
            <Image src="https://res.cloudinary.com/dsukslmgr/image/upload/v1752064727/ChatGPT_Image_Jul_9_2025_12_14_27_PM_l3fkk1.png" alt="SalistleAI Logo" width={40} height={40} />
            <h1 className="text-3xl font-bold">SalistleAI</h1>
          </div>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl">Terms & Privacy</CardTitle>
            <CardDescription>
              {lastUpdated ? (
                `Last updated on ${lastUpdated}`
              ) : (
                <Skeleton className="h-5 w-48 mx-auto" />
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-8 px-4 sm:px-6 md:px-8">
            <section id="terms">
              <h2 className="text-2xl font-semibold border-b pb-2">Terms and Conditions</h2>
              <p>Welcome to SalistleAI! These terms and conditions outline the rules and regulations for the use of SalistleAI's Website, located at this domain.</p>
              <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use SalistleAI if you do not agree to take all of the terms and conditions stated on this page.</p>

              <h3 className="text-xl font-semibold mt-4">User Accounts</h3>
              <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
              <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>

              <h3 className="text-xl font-semibold mt-4">Content</h3>
              <p>Our Service allows you to generate, post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you generate using our service, including its legality, reliability, and appropriateness.</p>
              <p>By generating Content using the Service, you represent and warrant that: (i) the Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the generation of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.</p>
              <p>We reserve the right to terminate the account of anyone found to be infringing on a copyright.</p>
              
              <h3 className="text-xl font-semibold mt-4">Subscriptions</h3>
              <p>Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set on a monthly basis.</p>
              <p>At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or SalistleAI cancels it. You may cancel your Subscription renewal either through your online account management page or by contacting SalistleAI customer support team.</p>

              <h3 className="text-xl font-semibold mt-4">Intellectual Property</h3>
              <p>The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of SalistleAI and its licensors. The Service is protected by copyright, trademark, and other laws of both the India and foreign countries. You retain all rights to any Content you submit, post or display on or through the Service and you are responsible for protecting those rights. We take no responsibility and assume no liability for Content you or any third party posts on or through the Service.</p>
              
              <h3 className="text-xl font-semibold mt-4">Termination</h3>
              <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>
              
              <h3 className="text-xl font-semibold mt-4">Limitation Of Liability</h3>
              <p>In no event shall SalistleAI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

            </section>

            <section id="privacy">
              <h2 className="text-2xl font-semibold border-b pb-2">Privacy Policy</h2>
              <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
              <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>

              <h3 className="text-xl font-semibold mt-4">Information We Collect</h3>
              <p>While using Our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not to:</p>
              <ul>
                <li>Email address</li>
                <li>Usage Data (e.g., stories generated)</li>
              </ul>
              <p>We do not store payment information on our servers. All payment transactions are processed through our secure payment gateway provider, Razorpay.</p>
              
              <h3 className="text-xl font-semibold mt-4">Use of Your Personal Data</h3>
              <p>SalistleAI may use Personal Data for the following purposes:</p>
              <ul>
                <li>To provide and maintain our Service, including to monitor the usage of our Service.</li>
                <li>To manage Your Account: to manage your registration as a user of the Service.</li>
                <li>To contact You: To contact you by email regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.</li>
                <li>To manage your requests: To attend and manage your requests to us.</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4">Data Security</h3>
              <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>

              <h3 className="text-xl font-semibold mt-4">Changes to this Privacy Policy</h3>
              <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>
              <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

              <h3 className="text-xl font-semibold mt-4">Contact Us</h3>
              <p>If you have any questions about this Privacy Policy, You can contact us by visiting the <Link href="/contact" className="text-primary hover:underline">contact page</Link> on our website.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

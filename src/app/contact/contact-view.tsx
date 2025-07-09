"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(500, { message: 'Description cannot exceed 500 characters.' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactView() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      description: '',
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    setLoading(true);
    console.log('Contact Form Submitted:', data);
    // In a real app, you would handle the form submission here,
    // e.g., send an email or save to a database via a server action.
    setTimeout(() => {
      toast({
        title: 'Message Sent!',
        description: 'Thank you for contacting us. We will get back to you shortly.',
      });
      form.reset();
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute top-4 left-4">
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
      </div>
      <div className="flex items-center gap-2 mb-8">
        <Image src="https://res.cloudinary.com/dsukslmgr/image/upload/v1752064727/ChatGPT_Image_Jul_9_2025_12_14_27_PM_l3fkk1.png" alt="SalistleAI Logo" width={40} height={40} />
        <h1 className="text-3xl font-bold">SalistleAI</h1>
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Contact Us</CardTitle>
          <CardDescription>
            Have a question or feedback? Fill out the form below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...form.register('name')}
                disabled={loading}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...form.register('email')}
                disabled={loading}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please describe your inquiry..."
                rows={5}
                {...form.register('description')}
                disabled={loading}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

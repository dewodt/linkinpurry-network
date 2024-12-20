import { Link, createFileRoute } from '@tanstack/react-router';
import { MessageCircle, Search, Users } from 'lucide-react';

import * as React from 'react';

import { AvatarUser } from '@/components/shared/avatar-user';
import { HelmetTemplate } from '@/components/shared/helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/context/session-provider';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  // Hooks
  const { session } = useSession();

  // Content
  const features = [
    {
      icon: Users,
      title: 'Expand Your Network',
      description: 'Connect with professionals from various industries and grow your circle.',
    },
    {
      icon: MessageCircle,
      title: 'Engage in Discussions',
      description: 'Participate in industry-specific forums and share your expertise.',
    },
    {
      icon: Search,
      title: 'Discover Opportunities',
      description: 'Find job openings, mentorship programs, and collaboration prospects.',
    },
  ];

  const reviews = [
    {
      name: 'Dewo',
      role: 'Fullstuck Developer',
      content: "This platform has revolutionized the way I network. I've made valuable connections that have significantly boosted my career.",
      avatar: 'https://avatars.githubusercontent.com/u/99950492?v=4',
    },
    {
      name: 'Yusuf Arsan',
      role: 'Software Engineer',
      content: "The community here is incredibly supportive. I've learned so much from the discussions and webinars available.",
      avatar: 'https://avatars.githubusercontent.com/u/113454186?v=4',
    },
    {
      name: 'Yusuf Rafi',
      role: 'Startup Founder',
      content: 'As an entrepreneur, this platform has been invaluable for finding mentors and potential business partners.',
      avatar: 'https://avatars.githubusercontent.com/u/118907510?v=4',
    },
  ];

  return (
    <>
      <HelmetTemplate title="LinkinPurry" />

      <main className="flex flex-1 flex-col">
        {/* Landing Page Section */}
        <section className="flex w-full items-center justify-center px-5 py-32 md:px-8 md:py-28 lg:py-32 xl:py-60">
          <div className="container flex flex-col items-center gap-4 text-center lg:gap-6">
            {/* Title */}
            <div className="flex flex-col items-center gap-3 lg:gap-6">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Connect, Grow, and Thrive Professionally
              </h1>

              <p className="max-w-2xl text-muted-foreground md:text-xl">
                Join the network where meaningful connections lead to endless opportunities. Build your professional circle and grow your career.
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-x-4 lg:space-x-6">
              <Link to="/explore">
                <Button variant="default" className="px-6">
                  Get Started
                </Button>
              </Link>

              <Link to="/" hash="why-chose-us">
                <Button variant="secondary" className="px-6">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Chose Us */}
        <section id="why-chose-us" className="flex w-full items-center justify-center bg-muted px-5 py-24 md:px-8 md:py-28 lg:py-32 xl:py-48">
          <div className="container">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose Us?</h2>

            <div className="flex flex-row flex-wrap items-center justify-center gap-6 lg:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="w-full max-w-[420px]">
                    <CardHeader>
                      <div className="flex flex-row items-center gap-4">
                        <Icon className="size-8" />
                        <CardTitle>{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p>{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* What our users say */}
        <section id="what-our-users-say" className="flex w-full items-center justify-center px-5 py-24 md:px-8 md:py-28 lg:py-32 xl:py-48">
          <div className="container">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>

            <div className="flex flex-row flex-wrap items-center justify-center gap-6 lg:gap-8">
              {reviews.map((testimonial, index) => (
                <Card key={index} className="w-full max-w-[420px]">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <AvatarUser src={testimonial.avatar} alt={`${testimonial.name}'s profile picture`} classNameAvatar="size-12" />

                    <div className="space-y-0.5">
                      <CardTitle className="text-xl/none">{testimonial.name}</CardTitle>
                      <CardDescription className="text-base">{testimonial.role}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>&quot;{testimonial.content}&quot;</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Join us now */}
        <section className="flex w-full items-center justify-center bg-muted px-5 py-24 md:px-8 md:py-28 lg:py-32 xl:py-48">
          <div className="container flex flex-col items-center gap-3 text-center lg:gap-5">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Join Our Community Today</h2>

            <p className="mx-auto max-w-4xl text-gray-500 dark:text-gray-400 md:text-xl">
              Start building meaningful professional relationships and unlock new opportunities.
            </p>

            {session ? (
              <Link to="/explore">
                <Button type="submit" className="px-7">
                  Explore Now
                </Button>
              </Link>
            ) : (
              <Link to="/auth/register">
                <Button type="submit" className="px-7">
                  Register Now
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

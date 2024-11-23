import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>

      <Input placeholder="lol" className="text-red-500 <style_mobile2> sm:text-blue-500 md:text-green-500 lg:text-orange-500" />
    </div>
  );
}

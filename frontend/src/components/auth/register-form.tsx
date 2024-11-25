import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { registerRequestBody } from '@/lib/schemas/auth';
import { register } from '@/services/auth';
import { RegisterErrorResponse, RegisterRequestBody, RegisterSuccessResponse } from '@/types/api/auth';

const RegisterForm = () => {
  // Router hooks
  const navigate = useNavigate();

  // Mutation hook
  const mutation = useMutation<RegisterSuccessResponse, RegisterErrorResponse, RegisterRequestBody>({
    mutationFn: async (val) => {
      const responseData = await register(val);
      return responseData;
    },
    onMutate: () => {
      toast.loading('Loading...', { description: 'Please wait', duration: Infinity });
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(error.response?.statusText || 'Error', { description: error.response?.data.message || 'An error occurred' });

      const errorFields = error.response?.data.errorFields;
      if (errorFields) {
        errorFields.forEach((field) => {
          form.setError(field.field as keyof RegisterRequestBody, { message: field.message });
        });
      }
    },
    onSuccess: async (data) => {
      toast.dismiss();
      toast.success('Success', { description: data.message });
      await navigate({ to: '/' });
    },
  });

  // Form Hooks
  const form = useForm<RegisterRequestBody>({
    resolver: zodResolver(registerRequestBody),
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  return (
    <div className="flex flex-col gap-5">
      <Form {...form}>
        <form onSubmit={handleSubmit((val) => mutation.mutate(val))} className="flex flex-col gap-5">
          {/* Username */}
          <FormField
            control={control}
            disabled={isSubmitting}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={control}
            disabled={isSubmitting}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Name */}
          <FormField
            control={control}
            disabled={isSubmitting}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={control}
            disabled={isSubmitting}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button variant="default" className="mt-1 w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register
          </Button>
        </form>
      </Form>

      <p className="text-center text-base">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-primary underline-offset-4 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export { RegisterForm };

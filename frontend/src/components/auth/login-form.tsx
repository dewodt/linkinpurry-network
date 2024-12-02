import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSession } from '@/context/session-provider';
import { loginRequestBody } from '@/lib/schemas/auth';
import { login } from '@/services/auth';
import { LoginErrorResponse, LoginRequestBody, LoginSuccessResponse } from '@/types/api/auth';

const LogInForm = () => {
  // Router hooks
  const navigate = useNavigate();

  // Session
  const { refetchSession } = useSession();

  // Mutation hook
  const mutation = useMutation<LoginSuccessResponse, LoginErrorResponse, LoginRequestBody>({
    mutationFn: async (val) => {
      const responseData = await login(val);
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
          form.setError(field.field as keyof LoginRequestBody, { message: field.message });
        });
      }
    },
    onSuccess: async (data) => {
      toast.dismiss();
      toast.success('Success', { description: data.message });

      await navigate({ to: '/' }); // TODO: change to /feed

      await refetchSession();
    },
  });

  // Form Hooks
  const form = useForm<LoginRequestBody>({
    resolver: zodResolver(loginRequestBody),
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
          {/* Identifier */}
          <FormField
            control={control}
            disabled={isSubmitting}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identifier</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Identifier" {...field} />
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
            Login
          </Button>
        </form>
      </Form>

      <p className="text-center text-base">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-primary underline-offset-4 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export { LogInForm };

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/context/session-provider';
import { updateProfileRequestBody } from '@/lib/schemas/user';
import { updateProfile } from '@/services/user';
import { GetProfileSuccessResponse, UpdateProfileErrorResponse, UpdateProfileRequestBody, UpdateProfileSuccessResponse } from '@/types/api/user';

interface EditProfileDialogProps {
  children: React.ReactNode;
  initialData: GetProfileSuccessResponse['data'];
}

const EditProfileDialog = ({ children, initialData }: EditProfileDialogProps) => {
  // dialog state
  const [open, setIsOpen] = React.useState(false);

  // hooks
  const { userId } = useParams({ from: '/users/$userId/' });
  const queryClient = useQueryClient();
  const { updateSession } = useSession();

  // Mutation hook
  const mutation = useMutation<UpdateProfileSuccessResponse, UpdateProfileErrorResponse, UpdateProfileRequestBody>({
    mutationFn: async (val) => {
      const responseData = await updateProfile({ userId }, val);
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
          form.setError(field.field as keyof UpdateProfileRequestBody, { message: field.message });
        });
      }
    },
    onSuccess: (data) => {
      toast.dismiss();
      toast.success('Success', { description: data.message });

      // update current session data
      updateSession({
        name: data.data.name,
        profilePhoto: data.data.profile_photo,
      });

      // update ['users', 'id'] data if exists
      queryClient.setQueryData<GetProfileSuccessResponse>(['users', userId], (prevData) => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          data: {
            ...prevData.data,

            // put data
            username: data.data.username,
            name: data.data.name,
            profile_photo: data.data.profile_photo,
            work_history: data.data.work_history,
            skills: data.data.skills,
          },
        };
      });

      // close dialog
      setIsOpen(false);

      // reset dirty state
      form.reset({
        username: data.data.username,
        name: data.data.name,
        profile_photo: undefined,
        work_history: data.data.work_history || '',
        skills: data.data.skills || '',
      });
    },
  });

  // Form Hooks
  const form = useForm<UpdateProfileRequestBody>({
    resolver: zodResolver(updateProfileRequestBody),
    defaultValues: {
      username: initialData.username,
      name: initialData.name,
      profile_photo: undefined,
      work_history: initialData.work_history || '',
      skills: initialData.skills || '',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = form;

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
          <DialogDescription>Update your public profile information</DialogDescription>

          <div className="flex flex-col gap-5">
            <Form {...form}>
              <form onSubmit={handleSubmit((val) => mutation.mutate(val))} className="flex flex-col gap-5">
                {/* Username */}
                <FormField
                  control={control}
                  disabled={mutation.isPending}
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

                {/* Name */}
                <FormField
                  control={control}
                  disabled={mutation.isPending}
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

                {/* Profile photo */}
                <FormField
                  control={control}
                  disabled={mutation.isPending}
                  name="profile_photo"
                  render={({ field: { onChange }, ...field }) => (
                    <FormItem>
                      <FormLabel>Profile Photo</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple={false}
                          placeholder="Profile Photo"
                          onChange={(e) => onChange(e.target.files![0])}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Work history */}
                <FormField
                  control={control}
                  disabled={mutation.isPending}
                  name="work_history"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work History</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Share your work hisotyr" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Skills */}
                <FormField
                  control={control}
                  disabled={mutation.isPending}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Share your skills" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button variant="default" className="mt-1 w-full" type="submit" disabled={mutation.isPending || !isDirty}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update
                </Button>
              </form>
            </Form>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export { EditProfileDialog };

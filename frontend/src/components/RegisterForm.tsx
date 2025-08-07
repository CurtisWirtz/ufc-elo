import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'; // Import resolver
import { api } from '../api/client.ts';
import { useAuth } from '../AuthProvider.tsx';
import { useNavigate, Link } from '@tanstack/react-router';
import { registerSchema } from '../schemas/authSchema';
import type { RegisterFormInputs } from '../schemas/authSchema';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function RegisterForm() {
  const form = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema), // Use Zod for validation
    defaultValues: { // Optional: Set default values for inputs
      username: '',
      password: '',
      password2: '',
    },
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  // The onSubmit function will only be called if validation passes
  const onSubmit = async (data: RegisterFormInputs) => {
    // isSubmitting will be true automatically when this function runs
    // setLoading(true) is not strictly necessary here, but can be used for extra control

    try {
      const res = await api.post('/api/user/register/', {
        username: data.username,
        password: data.password,
        password2: data.password2,
      });

      if (res.status === 201) {
        const { access, refresh, id, username } = res.data;

        const newUser = { id, username };

        if (access && refresh && newUser.id && newUser.username) {
          login(access, refresh, newUser);
          navigate({ to: '/events', replace: true });
        } else {
          // If for some reason tokens are missing, set a manual error
          form.setError("root.serverError", {
            type: "manual",
            message: "Registration successful, but tokens not received. Please try logging in."
          });
          navigate({ to: '/login', replace: true });
        }
      } else {
        form.setError("root.serverError", {
          type: "manual",
          message: `Registration failed with status: ${res.status}`
        });
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.response && err.response.data) {
        // Handle DRF validation errors returned from the backend
        // This is a thorough lil pattern to map backend errors to form fields
        if (err.response.data.username) {
          form.setError("username", {
            type: "server",
            message: err.response.data.username.join(', ')
          });
        }
        if (err.response.data.password) {
          form.setError("password", {
            type: "server",
            message: err.response.data.password.join(', ')
          });
        }
        // General non-field errors or other server messages
        if (err.response.data.non_field_errors) {
          form.setError("root.serverError", {
            type: "server",
            message: err.response.data.non_field_errors.join(', ')
          });
        } else if (typeof err.response.data === 'string') {
          form.setError("root.serverError", {
            type: "server",
            message: err.response.data
          });
        } else {
          form.setError("root.serverError", {
            type: "server",
            message: "An unexpected error occurred during registration."
          });
        }
      } else {
        form.setError("root.serverError", {
          type: "manual",
          message: "Network error or server unavailable."
        });
      }
    }
  };

  return (
    <Section
    className={cn(
        "overflow-hidden pb-0 sm:pb-0 md:pb-0 min-h-100 md:min-h-150",
        "",
    )}
    >
      <div className="flex flex-col items-center gap-6 sm:gap-12">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Registering is Quick!</CardTitle>
              <CardDescription>
                Choose a username and password to create an account
              </CardDescription>
              <CardAction className="flex flex-col text-center">
                  <span className='mb-1 text-sm'>Already registered?</span>
                  <Button variant="outline" className="cursor-pointer" asChild>
                      <Link to="/login">Login</Link>
                  </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  {/* Display general server-side errors */}
                  {form.formState.errors.root?.serverError && <p className="text-red-500 text-sm mb-4 text-center">{form.formState.errors.root.serverError.message}</p>}

                  <div className="mb-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                  <Input type="text" id="username" {...field} disabled={form.formState.isSubmitting} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                    />
                  </div>

                  <div className="mb-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                              <Input type="password" id="password" {...field} disabled={form.formState.isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="password2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                              <Input type="password" id="password2" {...field} disabled={form.formState.isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full cursor-pointer disabled:not-allowed" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Registering...' : 'Register'}
                  </Button>
                </form>  
              </Form>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
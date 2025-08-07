import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from "../api/client.ts";
import { useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '../AuthProvider.tsx';
import { loginSchema } from '../schemas/authSchema';
import type { LoginFormInputs } from '../schemas/authSchema';

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


const LoginForm: React.FC = () => {
    const form = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema), // Use Zod for validation
        defaultValues: { // Optional: Set default values for inputs
            username: '',
            password: '',
        },
    });

    // Get the login function from AuthContext
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data: LoginFormInputs) => {
        try {
            const res = await api.post('/api/token/', {
                username: data.username,
                password: data.password,
            });

            if (res.status === 200) {
                const { access, refresh } = res.data;
            
                if (access && refresh) {
                    login(access, refresh);
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
    }

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
                        <CardTitle>Login to your account</CardTitle>
                        <CardDescription>
                            Enter your credentials to login
                        </CardDescription>
                        <CardAction className="flex flex-col text-center">
                            <span className='mb-1 text-sm'>New here?</span>
                            <Button variant="outline" className="cursor-pointer">
                                <Link to="/register">Register</Link>
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

                                <Button type="submit" className="w-full cursor-pointer disabled:not-allowed" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? 'Logging In...' : 'Login'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </Section>
    )
}

export default LoginForm;
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from "../api/client.ts";
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../AuthProvider.tsx';
import { loginSchema } from '../schemas/authSchema';
import type { LoginFormInputs } from '../schemas/authSchema';


const LoginForm: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError
    } = useForm<LoginFormInputs>({
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
                    setError("root.serverError", {
                        type: "manual",
                        message: "Registration successful, but tokens not received. Please try logging in."
                    });
                    navigate({ to: '/login', replace: true });
                }
            } else {
                setError("root.serverError", {
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
                setError("username", {
                    type: "server",
                    message: err.response.data.username.join(', ')
                });
                }
                if (err.response.data.password) {
                setError("password", {
                    type: "server",
                    message: err.response.data.password.join(', ')
                });
                }
                // General non-field errors or other server messages
                if (err.response.data.non_field_errors) {
                setError("root.serverError", {
                    type: "server",
                    message: err.response.data.non_field_errors.join(', ')
                });
                } else if (typeof err.response.data === 'string') {
                setError("root.serverError", {
                    type: "server",
                    message: err.response.data
                });
                } else {
                setError("root.serverError", {
                    type: "server",
                    message: "An unexpected error occurred during registration."
                });
                }
            } else {
                setError("root.serverError", {
                    type: "manual",
                    message: "Network error or server unavailable."
                });
            }
        }
    }

    return (
            <div className="p-4 bg-white shadow-md rounded-lg max-w-md mx-auto my-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Display general server-side errors */}
        {errors.root?.serverError && <p className="text-red-500 text-sm mb-4 text-center">{errors.root.serverError.message}</p>}

        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
            Username:
          </label>
          <input
            type="text"
            id="username"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.username ? 'border-red-500' : ''}`}
            // Use {...register("fieldName")} to connect input to react-hook-form
            {...register("username")}
            disabled={isSubmitting}
          />
          {/* Display validation errors for the username field */}
          {errors.username && <p className="text-red-500 text-xs italic mt-1">{errors.username.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password:
          </label>
          <input
            type="password"
            id="password"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : ''}`}
            {...register("password")}
            disabled={isSubmitting}
          />
          {errors.password && <p className="text-red-500 text-xs italic mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
    </div>
    )
}

export default LoginForm;
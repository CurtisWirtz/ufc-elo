import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'; // Import resolver
import { api } from '../api/client.ts';
import { useAuth } from '../AuthProvider.tsx';
import { useNavigate } from '@tanstack/react-router';
import { registerSchema } from '../schemas/authSchema';
import type { RegisterFormInputs } from '../schemas/authSchema';

export function RegisterForm() {
  const {
    register, // Function to register inputs
    handleSubmit, // Wrapper for your submit handler
    formState: { errors, isSubmitting }, // Access errors and submission state
    setError // Function to manually set errors
  } = useForm<RegisterFormInputs>({
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
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg max-w-md mx-auto my-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      {/* handleSubmit wraps your onSubmit function. It handles validation before calling onSubmit. */}
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

        <div className="mb-6">
          <label htmlFor="password2" className="block text-gray-700 text-sm font-bold mb-2">
            Confirm Password:
          </label>
          <input
            type="password"
            id="password2"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${errors.password2 ? 'border-red-500' : ''}`}
            {...register("password2")}
            disabled={isSubmitting}
          />
          {errors.password2 && <p className="text-red-500 text-xs italic mt-1">{errors.password2.message}</p>}
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
  );
}
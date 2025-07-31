// components/HeaderSearchBar.tsx
import React from 'react';
import { useNavigate } from '@tanstack/react-router'; // Import useLocation to access state
import { useForm } from 'react-hook-form';
import { searchSchema } from '../schemas/searchSchema';
import type { SearchFormInputs } from '../schemas/searchSchema';
import { zodResolver } from '@hookform/resolvers/zod';

export const HeaderSearchBar: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }, // Added isValid for clarity
    reset, // reset the form after submission
    watch, // watch the current input value for button disabling
  } = useForm<SearchFormInputs>({
    resolver: zodResolver(searchSchema),
    mode: 'onSubmit', // Validate on submit only to pass all errors at once
    defaultValues: {
      searchQuery: '',
    },
  });

  // Watch the input field to get its current value for disabling button etc.
  const currentInputSearchTerm = watch('searchQuery');

  // This function is called if validation passes
  const onSubmit = (data: SearchFormInputs) => {
    navigate({
      to: '/search',
      search: { q: data.searchQuery },
    });
    reset(); // clear the input field after successful submission and navigation
  };

  // This function is called if validation fails
  const onError = (formErrors: typeof errors) => {
    const errorMessage = formErrors.searchQuery?.message || "Invalid search query.";
    
    // Even if there are validation errors, we navigate to the search page.
    // We pass the potentially invalid query and the error message via state.
    navigate({
      to: '/search',
      search: { q: currentInputSearchTerm || '' }, // Pass the user's attempted query
      state: { validationError: errorMessage },
    });
    // Do NOT reset the form here, so the user sees their invalid input when they land on the search page.
  };

  return (
    <div className="relative w-80">
      <form onSubmit={handleSubmit(onSubmit, onError)} className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search fighters or events..."
          {...register("searchQuery")}
          className={`flex-grow p-2 text-sm border rounded-md focus:outline-none focus:ring-1 ${
            errors.searchQuery ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
          aria-label="Search"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          // Button is disabled if input is empty or if it's currently submitting
          disabled={!currentInputSearchTerm.trim() || !isValid} // isValid from react-hook-form
        >
          Search
        </button>
      </form>
    </div>
  );
};
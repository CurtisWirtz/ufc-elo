// components/HeaderSearchBar.tsx
import React from 'react';
import { useNavigate } from '@tanstack/react-router'; // Import useLocation to access state
import { useForm } from 'react-hook-form';
import { searchSchema } from '../schemas/searchSchema';
import type { SearchFormInputs } from '../schemas/searchSchema';
import { zodResolver } from '@hookform/resolvers/zod';

export const HeaderSearchBar: React.FC = ({ sheetClose }) => {
  const navigate = useNavigate();

  const SheetClose = sheetClose;

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
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit, onError)} className="flex items-center relative">
        <input
          type="text"
          placeholder="Search for fighters and events by name..."
          {...register("searchQuery")}
          className={`flex-grow p-2 text-sm border rounded-md focus:outline-none focus:ring-1 ${
            errors.searchQuery ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
          aria-label="Search"
        />
        <SheetClose asChild>
          <button
            type="submit"
            className="absolute right-1.5 px-2 py-1.5 bg-gray-800 text-white text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            // Button is disabled if input is empty or if it's currently submitting
            disabled={!currentInputSearchTerm.trim() || !isValid} // isValid from react-hook-form
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
          </button>
        </SheetClose>
      </form>
    </div>
  );
};
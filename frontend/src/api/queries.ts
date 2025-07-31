import type { AxiosResponse } from 'axios';
import { api } from './client.ts';
import type { Event } from '../types/event.types.ts';
import type { Fighter } from '@/types/fighter.types.ts';

// Define the shape of your paginated response from the backend
export interface PaginatedResponse {
    count: number;
    next: string | null; // URL for the next page
    previous: string | null; // URL for the previous page
    results: Event[] | Fighter[]; // Array of items for the current page
}

type IndividualItem = Event | Fighter;

/**
 * Fetches a list of events from the API.
 * Accepts a full URL for the endpoint (including pagination params).
 *
 * @param endpointUrl The full URL to fetch (e.g., '/api/events/' or '/api/events/?page=2').
 * @returns A promise resolving to the paginated events response.
 */
export const getItems = async (endpointUrl: string): Promise<AxiosResponse<PaginatedResponse, any>> => {
    // console.log(`Fetching events from: ${endpointUrl}`);
    return await api.get<PaginatedResponse>(endpointUrl);
};

// Function to fetch a single item by ID
export const getItemById = async (id: string, collection: string): Promise<AxiosResponse<IndividualItem, any>> => {
    return await api.get<IndividualItem>(`/api/${collection}/${id}`);
};

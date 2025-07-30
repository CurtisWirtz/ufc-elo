import type { AxiosResponse } from 'axios';
import { api } from './client.ts';
import type { Event } from '../types/event.types.ts';

// Define the shape of your paginated response from the backend
export interface PaginatedEventsResponse {
    count: number;
    next: string | null; // URL for the next page
    previous: string | null; // URL for the previous page
    results: Event[]; // Array of events for the current page
}

/**
 * Fetches a list of events from the API.
 * Accepts a full URL for the endpoint (including pagination params).
 *
 * @param endpointUrl The full URL to fetch (e.g., '/api/events/' or '/api/events/?page=2').
 * @returns A promise resolving to the paginated events response.
 */
export const getEvents = async (endpointUrl: string): Promise<AxiosResponse<PaginatedEventsResponse, any>> => {
    // console.log(`Fetching events from: ${endpointUrl}`);
    return await api.get<PaginatedEventsResponse>(endpointUrl);
};

// Function to fetch a single event by ID
export const getEventById = async (id: string): Promise<AxiosResponse<Event, any>> => {
    return await api.get<Event>(`/api/events/${id}`);
};

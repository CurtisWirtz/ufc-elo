import type { AxiosResponse } from 'axios';
import type { Event } from '../types/event.types.ts';

import { client } from './client.ts';

// Function to fetch all events
export const getEvents = async (): Promise<AxiosResponse<Event[], any>> => {
    return await client.get<Event[]>('/events');
};

// Function to fetch a single event by ID
export const getEventById = async (id: string): Promise<AxiosResponse<Event, any>> => {
    return await client.get<Event>(`/events/${id}`);
};

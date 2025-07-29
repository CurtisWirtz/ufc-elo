import { QueryClient } from '@tanstack/react-query';

// It's important that all of my queryClient objects use the same instance, for shared cache and state
const queryClient = new QueryClient();

export { queryClient };
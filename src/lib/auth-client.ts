// ABOUTME: Better Auth client for browser-side authentication.
// ABOUTME: Provides reactive auth state and sign-in/out methods.

import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient({
	baseURL: typeof window !== 'undefined' ? window.location.origin : ''
});

// Reactive session state - use useSession for Svelte
export const { useSession } = authClient;

// Auth methods
export const signIn = authClient.signIn;
export const signOut = authClient.signOut;

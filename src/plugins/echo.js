/**
 * Laravel Echo — Reverb WebSocket plugin
 *
 * Usage in main.js:
 *   import echoPlugin from '@/plugins/echo'
 *   app.use(echoPlugin)
 *
 * The Echo instance is then available via:
 *   import { useEcho } from '@/plugins/echo'
 *   const echo = useEcho()
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance = null;

export function createEcho() {
    if (echoInstance) return echoInstance;

    const appKey = import.meta.env.VITE_REVERB_APP_KEY;

    if (!appKey) {
        console.warn('[Echo] VITE_REVERB_APP_KEY is not set — WebSocket disabled.');
        return null;
    }

    window.Pusher = Pusher;

    echoInstance = new Echo({
        broadcaster:     'reverb',
        key:             appKey,
        wsHost:          import.meta.env.VITE_REVERB_HOST      ?? 'localhost',
        wsPort:          Number(import.meta.env.VITE_REVERB_PORT)  || 8080,
        wssPort:         Number(import.meta.env.VITE_REVERB_PORT)  || 8080,
        scheme:          import.meta.env.VITE_REVERB_SCHEME    ?? 'http',
        forceTLS:       (import.meta.env.VITE_REVERB_SCHEME    ?? 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint:    '/broadcasting/auth',
        auth: {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token') ?? ''}`,
                Accept: 'application/json',
            },
        },
    });

    return echoInstance;
}

/** Retrieve the shared Echo instance — may return null if key is missing. */
export function useEcho() {
    if (!echoInstance) {
        createEcho();
    }
    return echoInstance;
}

/** Update the auth token after login / token refresh. */
export function updateEchoToken(token) {
    if (!echoInstance) return;
    echoInstance.options.auth.headers.Authorization = `Bearer ${token}`;
    echoInstance.connector.pusher.config.auth = echoInstance.options.auth;
}

/** Vue plugin */
export default {
    install(app) {
        // createEcho() may return null if VITE_REVERB_APP_KEY is unset
        const echo = createEcho();
        app.config.globalProperties.$echo = echo;
        app.provide('echo', echo);
    },
};

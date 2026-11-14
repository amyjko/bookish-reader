import { defineEnvVars } from '@sveltejs/kit/env';

// SvelteKit 3 only exposes environment variables that are declared here. The
// bookish-press components read these, and .env supplies the values a bound
// book uses. The reader never talks to Firebase, so they are placeholders.
const optional = (value: string | undefined) => value;

export const variables = defineEnvVars({
    PUBLIC_CONTEXT: { public: true, static: true },
    PUBLIC_READER: { public: true, static: true },
    PUBLIC_FIREBASE_PROJECT_ID: { public: true, static: true },
    PUBLIC_FIREBASE_API_KEY: { public: true, static: true },
    PUBLIC_FIREBASE_AUTH_DOMAIN: { public: true, static: true },
    PUBLIC_FIREBASE_STORAGE_BUCKET: { public: true, static: true },
    PUBLIC_FIREBASE_MESSAGING_SENDER_ID: { public: true, static: true },
    PUBLIC_FIREBASE_APP_ID: { public: true, static: true },
    // Emulator ports, which only the bookish.press test suites set.
    PUBLIC_EMULATOR_AUTH: { public: true, schema: optional },
    PUBLIC_EMULATOR_FIRESTORE: { public: true, schema: optional },
    PUBLIC_EMULATOR_STORAGE: { public: true, schema: optional },
    PUBLIC_EMULATOR_FUNCTIONS: { public: true, schema: optional },
});

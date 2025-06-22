# Chat Setup Instructions

To use the AI chat features in this application, you need to configure your Google AI API key.

1.  **Get a Google AI API Key:**
    *   Go to the [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Sign in with your Google account.
    *   Click "Create API key" to generate a new key.

2.  **Set up Environment Variables:**
    *   Create a new file named `.env.local` in the root of your project.
    *   Add the following line to the `.env.local` file, replacing `your-api-key` with the key you just created:

    ```
    GOOGLE_GENERATIVE_AI_API_KEY=your-api-key
    ```

3.  **Restart the Application:**
    *   If the application is currently running, stop it and restart it for the changes to take effect.

That's it! The chat should now be connected to the Google AI backend.
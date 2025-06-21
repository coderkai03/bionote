# Chat Component Setup

This project now includes a chat component that uses the `useChat` hook from the AI SDK. The chat panel is located on the right side of the application.

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following content:

```env
# OpenAI API Configuration
# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Set a custom model (defaults to gpt-3.5-turbo)
# OPENAI_MODEL=gpt-4
```

### 2. Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and paste it in your `.env.local` file

### 3. Run the Development Server

```bash
npm run dev
```

The chat component will be available on the right panel of your application.

## Features

- **Real-time chat**: Uses streaming responses for a smooth experience
- **Modern UI**: Clean, responsive design with dark mode support
- **Message history**: Maintains conversation context
- **Loading states**: Visual feedback during message processing
- **Error handling**: Graceful error handling for API failures

## Components

- `ChatPanel.tsx`: The main chat component with UI
- `app/api/chat/route.ts`: API endpoint for handling chat requests

## Customization

You can customize the chat by:
- Modifying the UI in `ChatPanel.tsx`
- Changing the AI model in the API route
- Adding system prompts or context
- Implementing user authentication 
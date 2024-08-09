

# Chat AI Application

This project is a chat AI application built using React for the frontend and Express for the backend. It leverages the Google AI Generative Language API to generate responses based on user prompts. 

## Features

- **Responsive Sidebar**: A sidebar that can be toggled open and closed.
- **Conversation History**: Save and manage conversation history with options to view, delete, and start new conversations.
- **Dynamic User Interface**: Uses React state management to dynamically update and display conversation data.
- **Text Sanitization**: Utilizes DOMPurify to sanitize HTML content.

## Installation

### Backend

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/chat-ai-app.git
   cd chat-ai-app
   ```

2. Navigate to the backend directory and install the dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with your Google API key:

   ```plaintext
   API_KEY=your_google_api_key
   ```

4. Start the backend server:

   ```bash
   npm start
   ```

### Frontend

1. Navigate to the frontend directory and install the dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Start the React application:

   ```bash
   npm start
   ```

## Usage

- **Start the Backend Server**: Make sure the backend server is running on port `3333`.
- **Start the Frontend Application**: The React app will run on port `3000` by default.

Navigate to `http://localhost:3000` in your browser to interact with the chat AI application.

## Code Overview

### Backend (`backend/server.js`)

The backend is an Express server that handles POST requests to `/api`. It uses the Google AI Generative Language API to generate responses based on user prompts.

### Frontend (`frontend/src/App.js`)

The frontend is a React application that includes:
- A responsive sidebar for managing conversation history.
- An input area for submitting prompts and viewing responses.
- Conversation history management with options to view, delete, and start new conversations.

## Dependencies

- **Backend**: `express`, `body-parser`, `@google-ai/generativelanguage`, `google-auth-library`
- **Frontend**: `react`, `react-dom`, `dompurify`, `marked`, `react-icons`, `uuid`

## Contributing

Feel free to fork the repository, make changes, and submit pull requests. For any issues or feature requests, please open an issue on GitHub.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


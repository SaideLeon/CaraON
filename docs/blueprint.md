# **App Name**: CaraON Frontend

## Core Features:

- User Authentication: User authentication (login/register) and token storage.
- Instance List: Display a list of user's WhatsApp instances (fetched from the API).
- Create Instance Form: Form to create a new WhatsApp instance, triggering the backend process.
- QR Code Display: Display a QR code (received via WebSocket) for the user to scan.
- Real-time Status Updates: Update the instance status in real-time (via WebSocket) to show connection status.
- Agent creation form: Display form to create a new agent within a specified instance or organization.
- Agent Persona Tuning Tool: Display an editor tool for tweaking the persona of a specified agent. A 'usefulness' score is computed from agent interactions and surfaced here, along with AI suggestions of ways to improve it.

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082) to convey trust and reliability.
- Background color: Very light Lavender (#F0F8FF), close to white to maintain a clean and modern interface.
- Accent color: Vibrant Purple (#BE29EC) to highlight key interactive elements.
- Headline Font: 'Space Grotesk' sans-serif, giving a modern, tech-centric impression; Body font: 'Inter', for better readability.
- Simple, outline-style icons for easy recognition.
- Clean, grid-based layout with enough white space for comfortable reading and interaction.
- Subtle transitions for feedback to improve the user experience when the agent status changes or data is updated.
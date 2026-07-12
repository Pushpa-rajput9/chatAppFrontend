# ConvoSphere Frontend

Real-time chat client built with React 18, Vite, Tailwind CSS, React Router and Socket.IO client.

## Setup
```bash
npm install
cp .env.example .env   # point VITE_API_URL / VITE_SOCKET_URL at your backend
npm run dev
```

## Structure
```
src/
  api/            axios instance + one module per REST resource
  context/        AuthContext (session) and SocketContext (realtime)
  hooks/          useAuth, useSocket, useConversations, useMessages
  components/
    ui/           Avatar, Button, Input, Modal, Spinner, EmptyState
    layout/       AuthLayout, AppLayout, ProtectedRoute, PublicRoute
    chat/         Sidebar, ChatWindow, ChatHeader, MessageBubble,
                   MessageInput, TypingIndicator, NewChatModal
  pages/          LoginPage, RegisterPage
  utils/          formatTime, getInitials, constants
```

Every piece of UI is a small, single-purpose, reusable component; all
data-fetching/socket logic lives in hooks so pages and components stay
declarative.
# chatAppFrontend

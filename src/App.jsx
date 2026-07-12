import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { SocketProvider } from "./context/SocketProvider.jsx";
import { CallProvider } from "./context/CallProvider.jsx";
import { ConversationsProvider } from "./context/ConversationsProvider.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import PublicRoute from "./components/layout/PublicRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import ChatWindow from "./components/chat/ChatWindow.jsx";
import IncomingCallModal from "./components/call/IncomingCallModal.jsx";
import ActiveCallScreen from "./components/call/ActiveCallScreen.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ConversationsProvider>
          <CallProvider>
            <Routes>
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/chat" element={null} />
                  <Route
                    path="/chat/:conversationId"
                    element={<ChatWindow />}
                  />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>

            <IncomingCallModal />
            <ActiveCallScreen />
          </CallProvider>
        </ConversationsProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import IncomingCall from './components/IncomingCall';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Feed from './pages/Feed';
import Reels from './pages/Reels';
import Search from './pages/Search';
import Messages from './pages/Messages';
import ChatView from './pages/ChatView';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import VideoCall from './pages/VideoCall';
import VoiceCall from './pages/VoiceCall';

export default function App() {
  return (
    <AuthProvider>
      <div className="bg-gradient"></div>
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          element={
            <PrivateRoute>
              <>
                <IncomingCall />
                <Layout />
              </>
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Feed />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/search" element={<Search />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:chatId" element={<ChatView />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
        <Route
          path="/call/video/:callId"
          element={
            <PrivateRoute>
              <VideoCall />
            </PrivateRoute>
          }
        />
        <Route
          path="/call/voice/:callId"
          element={
            <PrivateRoute>
              <VoiceCall />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CharacterProvider } from './context/CharacterContext';
import { DiabloLayout } from './components/layout/DiabloLayout';
import { AvatarDisplay } from './components/avatar/AvatarDisplay';
import { StatInput } from './components/ui/StatInput';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { WhoopCallback } from './pages/WhoopCallback';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Main dashboard component
const Dashboard = () => {
  return (
    <CharacterProvider>
      <DiabloLayout>
        <div className="content-grid">
          <AvatarDisplay />
          <StatInput />
        </div>
      </DiabloLayout>
    </CharacterProvider>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/whoop/callback" element={<WhoopCallback />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

import { Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileSetup from "./pages/ProfileSetup";
import Logout from "./pages/Logout";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import ProblemPage from "./pages/ProblemPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signin" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/register" element={<Signup />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/setup-profile" element={<ProfileSetup />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/profile" element={<UserDashboard />} />
      <Route path="/profile/:username" element={<UserDashboard />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/problem/:id" element={<ProblemPage />} />
      <Route path="/problems/:id" element={<ProblemPage />} />
    </Routes>
  );
}

export default App;

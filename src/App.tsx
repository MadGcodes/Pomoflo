
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PomodoroProvider } from "./contexts/PomodoroContext";
import { TaskProvider } from "./contexts/TaskContext";
import { UserDataProvider } from "./contexts/UserDataContext";
import QRScanner from "@/components/qrscanner";
import { BrowserRouter as Router } from "react-router-dom";

import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Sounds from "./pages/Sounds";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Notes from "./pages/Notes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PomodoroProvider>
        <TaskProvider>
          <UserDataProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
                <Routes>
                  <Route path="/" element={<Navigate to="/splash" replace />} />
                  <Route path="/splash" element={<SplashScreen />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/qr" element={<QRScanner />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/sounds" element={<Sounds />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
            </TooltipProvider>
          </UserDataProvider>
        </TaskProvider>
      </PomodoroProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

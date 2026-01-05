import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { type AppDispatch } from './store';
import type { RootState } from './store';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import LoginNew from './pages/common/LoginNew';
import SignUp from './pages/common/SignUp';
import Dashboard from './pages/common/Dashboard';
import ProjectBoard from './pages/common/ProjectBoard';
import TeamOverview from './pages/common/TeamOverview';
import AdminTeamsView from './pages/admin/AdminTeamsView';
import AdminProjectsView from './pages/admin/AdminProjectsView';
import ManagerProjects from './pages/manager/ManagerProjects';
import MemberProjects from './pages/member/MemberProjects';
import ManagerTasks from './pages/manager/ManagerTasks';
import MemberTasks from './pages/member/MemberTasks';
import Chat from './pages/common/Chat';
import ProtectedRoute from './routes/ProtectedRoute';
import { onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth } from './firebase/firebase';
import { setCredentials, logout } from './store/auth.slice';
import axios from './lib/axios';
import { connectSocket, disconnectSocket } from './lib/socket';
import { useEffect } from 'react';

function AppInner() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const un = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        dispatch(logout());
        disconnectSocket();
        return;
      }
     
      const token = await user.getIdToken();
      // Save token and basic user info
      dispatch(
        setCredentials({
          user: { uid: user.uid, email: user.email || undefined, name: user.displayName || undefined },
          token,
        }),
      );

      try {
        // Fetch server-side user object (temporary /protected route that returns req.user)
        const res = await axios.get('/protected');
        const serverUser = res.data.user;
        if (serverUser) {
          // Preserve the user object from Firebase while adding role and teamId from server
          dispatch(setCredentials({ 
            user: { uid: user.uid, email: user.email || undefined, name: user.displayName || undefined, id: serverUser.id },
            role: serverUser.role || null, 
            teamId: serverUser.teamId || null 
          }));
          // Connect socket (works with or without teamId)
          connectSocket(token, serverUser.teamId || null);
        } else {
          connectSocket(token, null);
        }
      } catch (e) {
        // Connect socket even if /protected fails (user might still be authenticated)
        connectSocket(token, null);
      }
    });

    return () => un();
  }, [dispatch]);

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginNew />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/:teamId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TeamOverview />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AdminTeamsView />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AdminProjectsView />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProjectsRouter />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/tasks"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ManagerTasks />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/tasks"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MemberTasks />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProjectBoard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/:teamId/project/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProjectBoard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Chat />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </>
  );
}

const ProjectsRouter = () => {
  const role = useSelector((state: RootState) => state.auth.role);
  
  if (role === 'MEMBER') {
    return <MemberProjects />;
  }
  
  return <ManagerProjects />;
};

function App() {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
}

export default App;

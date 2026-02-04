import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { useAuthStore } from './store/useAuthStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ShowPlans from './pages/ShowPlans';
import MyShowPlans from './pages/MyShowPlans';
import CreateShowPlan from './pages/CreateShowPlan';
import EditShowPlan from './pages/EditShowPlan';
import ShowPlanDetail from './pages/ShowPlanDetail';
import ShowList from './pages/shows/ShowList';
import CreateShow from './pages/shows/CreateShow';
import EditShow from './pages/shows/EditShow';
import GuestList from './pages/guests/GuestList';
import CreateGuest from './pages/guests/CreateGuest';
import EditGuest from './pages/guests/EditGuest';
import TeamList from './pages/team/TeamList';
import CreateTeamMember from './pages/team/CreateTeamMember';
import EditTeamMember from './pages/team/EditTeamMember';
import UserList from './pages/users/UserList';
import CreateUser from './pages/users/CreateUser';
import EditUser from './pages/users/EditUser';
import UserRoles from './pages/users/UserRoles';
import Chat from './pages/Chat';
import Tasks from './pages/Tasks';
import NotFound from './pages/NotFound';
import Archives from './pages/Archives';
import FullProgram from './pages/FullProgram';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import SignupWithInvite from './pages/auth/SignupWithInvite';
import ResetPassword from './pages/auth/ResetPassword';
import QuotesList from './pages/Quotes/QuotesList';
import CreateQuote from './pages/Quotes/CreateQuote';
import QuoteDetail from './pages/Quotes/QuoteDetail';

const App: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => Boolean(state.token));

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <Login />
            } 
          />
          <Route path="/signup/:token" element={<SignupWithInvite />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            
            {/* Show Plans */}
            <Route path="show-plans">
              <Route index element={<ShowPlans />} />
              <Route path="create" element={<CreateShowPlan />} />
              <Route path=":id" element={<ShowPlanDetail />} />
              <Route path=":id/edit" element={<EditShowPlan />} />
            </Route>

            {/* My Show Plans */}
            <Route path="my-show-plans">
              <Route index element={<MyShowPlans />} />
              <Route path="create" element={<CreateShowPlan />} />
              <Route path=":id" element={<ShowPlanDetail />} />
              <Route path=":id/edit" element={<EditShowPlan />} />
            </Route>

            {/* Full Program */}
            <Route path="full-program" element={<FullProgram />} />

            {/* Archives */}
            <Route path="archives" element={<Archives />} />

            {/* Shows */}
            <Route path="shows">
              <Route index element={<ShowList />} />
              <Route path="create" element={<CreateShow />} />
              <Route path=":id/edit" element={<EditShow />} />
            </Route>

            {/* Guests */}
            <Route path="guests">
              <Route index element={<GuestList />} />
              <Route path="create" element={<CreateGuest />} />
              <Route path=":id/edit" element={<EditGuest />} />
            </Route>

            {/* Team */}
            <Route path="team">
              <Route index element={<TeamList />} />
              <Route path="create" element={<CreateTeamMember />} />
              <Route path=":id/edit" element={<EditTeamMember />} />
            </Route>

            {/* Users */}
            <Route path="users">
              <Route index element={<UserList />} />
              <Route path="create" element={<CreateUser />} />
              <Route path=":id/edit" element={<EditUser />} />
              <Route path=":id/roles" element={<UserRoles />} />
            </Route>

            {/* Quotes */}
            <Route path="quotes">
              <Route index element={<QuotesList />} />
              <Route path="create" element={
                <ProtectedRoute requiredPermission="quotes_create">
                  <CreateQuote />
                </ProtectedRoute>
              } />
              <Route path=":id" element={<QuoteDetail />} />
            </Route>

            {/* Tasks */}
            <Route path="tasks" element={<Tasks />} />

            {/* Settings */}
            <Route path="settings" element={<Settings />} />

            {/* Profile */}
            <Route path="profile" element={<Profile />} />

            {/* Chat */}
            <Route path="chat" element={<Chat />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
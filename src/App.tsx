import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Unauthorized } from '@/pages/Unauthorized';

// Portals
import { StudentDashboard } from '@/pages/StudentDashboard';
import { StudentExams } from '@/pages/student/StudentExams';
import { StudentExamDetail } from '@/pages/student/StudentExamDetail';
import { StudentExamRunner } from '@/pages/student/StudentExamRunner';
import { StudentResult } from '@/pages/student/StudentResult';

import { FacultyDashboard } from '@/pages/FacultyDashboard';
import { QuestionBank } from '@/pages/faculty/QuestionBank';
import { ExamBuilder } from '@/pages/faculty/ExamBuilder';
import { FacultyExams } from '@/pages/faculty/FacultyExams';
import { FacultyResults } from '@/pages/faculty/FacultyResults';

import { AdminDashboard } from '@/pages/AdminDashboard';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminAuditLogs } from '@/pages/admin/AdminAuditLogs';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Student Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exams"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentExams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exams/:examId"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentExamDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/runner/:attemptId"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentExamRunner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentResult />
              </ProtectedRoute>
            }
          />

          {/* Faculty Protected Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/questions"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <QuestionBank />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/exams"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyExams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/exams/create"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <ExamBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/results"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyResults />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAuditLogs />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

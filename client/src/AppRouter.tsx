
import { Routes, Route } from "react-router-dom";
import AppLayout from "./pages/AppLayout";
import Dashboard from "./pages/Dashboard";

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />
    </Routes>
  );
}

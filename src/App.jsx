/**
 * @file App.jsx
 * @description Root application component.
 *
 * Provides the context tree and mounts the router.
 * No business logic lives here — all lifted to contexts and pages.
 */

import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import AppRoutes from "./routes/AppRoutes";

import "./styles/variables.css";
import "./styles/layout.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          {/* Global toast notifications — replaces all alert() calls */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { fontSize: "0.875rem" },
            }}
          />
          <AppRoutes />
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}


export default App;

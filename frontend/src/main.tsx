import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { useAuthStore } from "./store/authStore";
import { initializeMockData } from './lib/mockDataInit';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from "./components/theme-provider.tsx";

function AppWrapper() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize mock data when component mounts
    initializeMockData();
    initialize();
  }, [initialize]);

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ErrorBoundary>
        <AppWrapper />
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>
);

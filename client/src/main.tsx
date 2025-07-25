import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { errorHandler } from "./lib/error-handler";
import { performanceMonitor } from "./lib/performance-monitor";

// Initialize error handling and performance monitoring for production
errorHandler; // Initialize singleton
performanceMonitor.logWebVitals();

createRoot(document.getElementById("root")!).render(<App />);

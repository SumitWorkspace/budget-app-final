import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { SettingsProvider } from "./context/SettingsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";
import { SearchProvider } from "./context/SearchContext";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
    <BrowserRouter>
      <ThemeProvider>
        <SettingsProvider>
          <SidebarProvider>
            <SearchProvider>
              <App />
            </SearchProvider>
          </SidebarProvider>
        </SettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
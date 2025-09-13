import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Toaster } from "sonner";
import "./assets/index.css";
import "leaflet/dist/leaflet.css";
import Router from "./routes/index.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    offset={{ bottom: "24px", right: "16px", left: "16px" }}
                />
                <Router />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);

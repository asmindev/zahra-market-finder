import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Toaster } from "sonner";
import "./assets/index.css";
import "leaflet/dist/leaflet.css";
import Router from "./routes/index.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <Toaster
                position="top-right"
                offset={{ bottom: "24px", right: "16px", left: "16px" }}
            />
            <Router />
        </BrowserRouter>
    </StrictMode>
);

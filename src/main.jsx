import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import Footer from "./frontend/components/footer";
import { AuthProvider } from "./backend/auth";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Footer />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // 1. Import BrowserRouter
import App from "./App"; // Or your main Chatbot component if you render it directly

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 2. Wrap your application in BrowserRouter */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
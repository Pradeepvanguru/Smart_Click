import React from "react";
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,       // Opt-in to v7 behavior early
        v7_relativeSplatPath: true,    // Opt-in to v7 behavior early
      }}
    >
      <div>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Home />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
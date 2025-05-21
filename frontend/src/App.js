import { TbNetworkOff } from "react-icons/tb"; 
import React from "react";
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Success from "./pages/Success";

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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/success" element={<Success />} />
          <Route path="*" element={<div className='my-5 py-5'><center><h2>404 - Page Not Found <TbNetworkOff fontSize={50} /></h2></center></div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
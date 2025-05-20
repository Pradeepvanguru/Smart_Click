import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
    const response = await fetch(`${process.env.REACT_APP_URI}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: form.email, password: form.password }),

    });

    const result = await response.json();

    if (response.ok) {
      sessionStorage.setItem('token', result.token);
      if (result.collectionName) {
        sessionStorage.setItem('collectionName', result.collectionName);
      }

     toast.success('Login successful 🎉');
      navigate('/'); // Redirect to dashboard or home page
      // Redirect or show success
    } else {
      console.error('Login failed:', result.msg);
      toast.info(result.msg);
    }
  } catch (err) {
      toast.info(err.response.data.msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 col-md-4 shadow-lg p-4">
      <center><h3>Login</h3></center>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 p-2">
          <label>Email</label>
          <input 
            className="form-control" 
            name="email" 
            type="email" 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3 p-2">
          <label>Password</label>
          <div className="input-group">
            <input 
              className="form-control" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              onChange={handleChange} 
              required 
            />
            <button 
              type="button" 
              className="btn shadow-lg" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <button className="btn btn-success w-100" disabled={loading}>
          {loading ? (
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : null}
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-center mt-4">
        Don't have an account?{' '}
        <button
          onClick={() => navigate('/signup')}
          className="btn btn-link p-0 text-decoration-none"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}

export default Login;

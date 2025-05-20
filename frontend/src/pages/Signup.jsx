import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_URI}/api/auth/signup`, form);
      toast.success('Signup successful');
      navigate('/login');
    } catch (err) {
      toast.info(err.response.data.msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 col-md-4 shadow-lg rounded p-4">
      <center><h3>Signup</h3></center>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 p-2">
          <label>Name</label>
          <input 
            className="form-control" 
            name="name" 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3 p-2">
          <label>Email</label>
          <input 
            type="email" 
            className="form-control" 
            name="email" 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3 p-2">
          <label>Password</label>
          <div className="input-group">
            <input 
              type={showPassword ? "text" : "password"} 
              className="form-control" 
              name="password" 
              onChange={handleChange} 
              required 
            />
            <button 
              type="button" 
              className="btn shadow-sm" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? (
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : null}
          {loading ? 'Signing up...' : 'Signup'}
        </button>
      </form>
      <p className="text-center mt-4">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="btn btn-link p-0 text-decoration-none"
        >
          Login
        </button>
      </p>
    </div>
  );
}

export default Signup;

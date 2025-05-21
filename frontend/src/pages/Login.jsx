import React, { useState } from 'react';
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
    <div className="container mt-5 col-sm-5 shadow-lg p-4" style={{
      maxWidth: '100%',
      margin: '20px auto',
      padding: '15px',
      borderRadius: '8px',
      '@media (max-width: 480px)': {
        margin: '3px',
        padding: '5px'
      }
    }}>
      <center>
        <h3 style={{ 
          fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
          marginBottom: '1rem'
        }}>Login</h3>
      </center>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-2 p-2">
          <label style={{ 
            fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
            marginBottom: '0.25rem'
          }}>Email</label>
          <input 
            className="form-control" 
            name="email" 
            type="email" 
            onChange={handleChange} 
            required 
            style={{
              fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
              padding: '6px 10px',
              height: '38px'
            }}
          />
        </div>
        <div className="mb-2 p-2">
          <label style={{ 
            fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
            marginBottom: '0.25rem'
          }}>Password</label>
          <div className="input-group">
            <input 
              className="form-control" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              onChange={handleChange} 
              required 
              style={{
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                padding: '6px 10px',
                height: '38px'
              }}
            />
            <button 
              type="button" 
              className="btn shadow-lg" 
              onClick={() => setShowPassword(!showPassword)}
              style={{
                padding: '6px 10px',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                height: '38px'
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <button 
          className="btn btn-success w-100" 
          disabled={loading}
          style={{
            fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
            padding: '8px',
            height: '38px',
            marginTop: '0.5rem'
          }}
        >
          {loading ? (
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : null}
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-center mt-3" style={{ 
        fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
        margin: '0.5rem 0'
      }}>
        Don't have an account?{' '}
        <button
          onClick={() => navigate('/signup')}
          className="btn btn-link p-0 text-decoration-none"
          style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}
        >
          Sign up
        </button>
      </p>
    </div>
  );
}

export default Login;

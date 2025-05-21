import { BiLogOut } from "react-icons/bi"; 
import { GiSteamBlast } from "react-icons/gi"; 
import React,{useEffect,useState} from "react";
import EmailForm from "../components/EmailForm";
import { SiProcessingfoundation } from "react-icons/si"; 
import {useNavigate} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";


const Home = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [showLogout, setShowLogout] = useState(false);
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.name || ''); // Adjust based on your token's payload structure
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }
  }, []);


   const handleBack = () => {
    navigate("/");
  }

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    setUserName('');
    toast.success('Logged out successfully');
    navigate('/');
  };
  
  return (
    <div className="app-container">
     
     <div className="d-flex justify-content-between align-items-center px-3 py-2">
  {/* Logo Section */}
  <div className="d-flex align-items-center" style={{ cursor: "pointer" }} onClick={handleBack}>
    <SiProcessingfoundation fontSize={50} color="grey" />
<<<<<<< HEAD
    <span className="ms-2 text-secondary  fw-semibold">NEXTGEN JOB PORTAL </span>
=======
    <span className="ms-2 text-secondary  fw-semibold">Smart Click</span>
>>>>>>> 646642111932e87d2d253d391f23d9f58cafc653
  </div>

  {/* Profile or Auth Buttons */}
  <div className="d-flex align-items-center gap-2">
    {sessionStorage.getItem('token') && userName ? (
      <>
      <div
        className="profile-circle d-flex align-items-center justify-content-center rounded-circle bg-primary text-white"
        style={{
          width: '40px',
          height: '40px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
        onClick={() => setShowLogout(!showLogout)}
      >
        {userName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()}
      </div>
      {showLogout && (
        <div
          className="position-absolute bg-white shadow rounded py-1 px-2 mx-2"
          style={{
            display: 'flex',
            right: '55px',
            top: '80px',
            zIndex: 1000,
            Width: '100px',
            border: '1px solid #dee2e6',
           
          }}
        >
          <button
            onClick={handleLogout}
            className="btn btn-link text-danger text-decoration-none px-2 my-1"
            style={{ fontSize: '14px' }}
          >
            <BiLogOut /> Logout
          </button>
        </div>
      )}

      </>
    ) : (
      <>
        <button
          style={{ fontSize: 12, fontWeight: 600, width: 100 }}
          onClick={() => navigate('/login')}
          className="btn btn-outline-primary"
        >
          Login
        </button>
        <button
          style={{ fontSize: 12, fontWeight: 600, width: 100 }}
          onClick={() => navigate('/signup')}
          className="btn btn-outline-primary"
        >
          Sign Up
        </button>
      </>
    )}
  </div>
</div>

      <h4 className="email_title">Send Your Email Application To HR's or Referral Contacts through Smart Click <GiSteamBlast /></h4>
      <EmailForm />
    </div>
  );
};

export default Home;

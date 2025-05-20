import { GiPartyPopper } from "react-icons/gi"; 
import { TbPlayerTrackNextFilled } from "react-icons/tb";
import { GoZap } from "react-icons/go";
import { SiProcessingfoundation } from "react-icons/si";
import { FaFileSignature } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Welcome.css';
import example_dataset from './asserts/example_dataset.png';
import { jwtDecode } from "jwt-decode";
import example_Email from './asserts/example_Email.png';


const Welcome = () => {
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const collectionName = sessionStorage.getItem('collectionName');
  const [userName, setUserName] = useState("");
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.name || ''); 
        // console.log(decoded)// Adjust based on your token's payload structure
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }
    checkDataExists();
  }, []);

  const checkDataExists = async () => {
  const token = sessionStorage.getItem('token');
  if (!collectionName || !token) return;

  setLoading(true);
  try {
    const response = await fetch(
      `${process.env.REACT_APP_URI}/api/check-data?collectionName=${collectionName}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    // Set state: True if any Mongo or file data exists
    setIsFileUploaded(result.hasData);
  } catch (error) {
    console.error('Error checking data:', error);
    setIsFileUploaded(false);
  } finally {
    setLoading(false);
  }
};


  const handleDeleteData = async () => {
    if (!collectionName) {
      toast.error('Collection name not found in local storage');
      return;
    }

    setLoading(true);
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_URI}/api/delete-csv?collectionName=${collectionName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
        
      });

      const result = await response.json();
      if (response.ok) {
        setIsFileUploaded(false);
        toast.success('CSV data deleted successfully!');
        sessionStorage.removeItem('collectionName');
      } else {
        toast.error(result.message || 'Failed to delete CSV data');
      }
    } catch (error) {
      toast.error('Error deleting data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const token = sessionStorage.getItem('token');

    if (!token) {
      toast.info('Please login first');
      return;
    }

    if (file) {
      if (file.type === 'text/csv') {
        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_URI}/api/upload-csv`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData,
          });

          const result = await response.json();
          if (response.ok) {
            setIsFileUploaded(true);
            sessionStorage.setItem('collectionName', result.collectionName);
            // toast.success('CSV imported to MongoDB successfully!');
          } else {
            toast.error(result.message || 'Failed to upload CSV');
          }
        } catch (error) {
          toast.error('Error uploading file');
        } finally {
          setLoading(false);
        }
      } else {
        toast.error('Please upload only CSV files!');
      }
    }
  };

  const handleSendEmails = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.info('Please login to Proceeds...!');
      return;
    }
    else{
    navigate('/home');
  }
  };

  const handleLogout = () => {
    const Collectionname = sessionStorage.getItem('collectionName');
    if(Collectionname){
    handleDeleteData ()
  }
    setUserName('');
    toast.success('Logged out successfully');
    sessionStorage.clear();
    navigate('/');

  };

  return (
    <div className="welcome-container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Loading, please wait...</p>
        </div>
      )}
      
      <nav className="navbar navbar-expand-lg navbar-light px-1">
        <div className="container-fluid">
          <div className="navbar-brand d-flex align-items-center">
            <SiProcessingfoundation fontSize={50} color="grey" />
            <span className="ms-2 text-secondary">Smart Click</span>
          </div>
          <div className="d-flex gap-2 justify-content-evenly align-items-center position-relative">
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
          className="position-absolute bg-white shadow rounded py-2 px-3"
          style={{
            right: 0,
            top: '50px',
            zIndex: 1000,
            minWidth: '120px',
            border: '1px solid #dee2e6',
          }}
        >
          <button
            onClick={handleLogout}
            className="btn btn-link text-danger text-decoration-none p-0"
            style={{ fontSize: '14px' }}
          >
            Logout
          </button>
        </div>
      )}
    </>
  ) : (
    <>
      <button
        style={{ fontSize: 14, fontWeight: 600, width: 100 }}
        onClick={() => navigate('/login')}
        className="btn btn-outline-primary me-2"
      >
        Login
      </button>
      <button
        style={{ fontSize: 14, fontWeight: 600, width: 100 }}
        onClick={() => navigate('/signup')}
        className="btn btn-outline-primary me-2"
      >
        Sign Up
      </button>
    </>
  )}
</div>


        </div>
      </nav>

      <div className="main-content">
        <h1 className="welcome-title">Welcome to Smart Click to get Job Opportunity ...<GiPartyPopper  /></h1>
        <p className="p-2">🌟<i>"Your dream job is just one click away - explore opportunities and take the next step in your career today!"</i></p>

        <div className="buttons-container">
          <div className="button-group">
            <button
              className={`action-button ${!isFileUploaded ? 'disabled' : ''}`}
              onClick={handleSendEmails}
              disabled={!isFileUploaded}
            >
              <GoZap color="yellow" size={23} /> Smart Click <TbPlayerTrackNextFilled fontSize={20} />
            </button>

            <label className={`file-upload-button ${isFileUploaded ? 'disabled' : ''}`}>
              <FaFileSignature fontSize={35} /> Import CSV File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={isFileUploaded}
              />
            </label>

            {isFileUploaded && (
              <button
                className="delete-button"
                onClick={handleDeleteData}
              >
                <MdDeleteForever size={30} />
              </button>
            )}
          </div>
        </div>

        <div className="instructions-container">
          <h3>How to Use?</h3>
          <ol>
            <li>Prepare your CSV file with email addresses and other required information</li>
            <li>Click on "Import CSV File" button to upload your data</li>
            <li>Wait for the success notification</li>
            <li>Once file is uploaded, "Send Emails" button will be enabled</li>
            <li>Click "Good To GO" to proceed with sending your emails</li>
            <li>Place the correct and exact placeholder when you want in place</li>
            <li>Don't change the cases in the Square bracket Words like this: [name] to [Name] ✖️</li>
            <li>Once you complete writing the Email then click the "Send Email" Button</li>
          </ol>

          <div className="example-dataset">
            <h4>Example Dataset Format:</h4>
            <img
              src={example_dataset}
              alt="Example CSV Dataset Format"
              className="dataset-image"
            />
            <p className="dataset-note">Note: Make sure your CSV file follows this format</p>
          </div>

           <div className="example-dataset">
            <h4>Example Email Format:</h4>
            <img
              src={example_Email}
              alt="Example CSV Dataset Format"
              className="dataset-image"
            />
            <p className="dataset-note">Note: Make sure your Email follows this format</p>
          </div>
        </div>

        <div className="contact-section">
          <h3>Contact Us</h3>
          <p>If you have any questions or need support, please reach out to us:</p>
          <div className="contact-info">
            <p>Email: vangurupradeep123@gmail.com</p>
            <p>Phone: +91 7386385309</p>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2025 vanguru pradeep. All rights reserved. <SiProcessingfoundation fontSize={15} color="grey" /></p>
      </footer>
    </div>
  );
};

export default Welcome;

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

const Welcome = () => {
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const collectionName = localStorage.getItem('collectionName');

  useEffect(() => {
    checkDataExists();
  }, []);

  const checkDataExists = async () => {
    if (!collectionName) return;
    setLoading(true);
    try {
      const response = await fetch(`https://smart-job-portal.onrender.com/api/check-data?collectionName=${collectionName}`);
      const result = await response.json();
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
    try {
      const response = await fetch(`https://smart-job-portal.onrender.com/api/delete-csv?collectionName=${collectionName}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (response.ok) {
        setIsFileUploaded(false);
        toast.success('CSV data deleted successfully!');
        localStorage.clear();
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

    if (file) {
      if (file.type === 'text/csv') {
        const formData = new FormData();
        const originalFileName = file.name.split('.')[0];
        const generatedCollectionName = `collection_${originalFileName}_${Date.now()}`;
        localStorage.setItem('collectionName', generatedCollectionName);
        formData.append('file', file);
        formData.append('collectionName', generatedCollectionName);

        setLoading(true);
        try {
          const response = await fetch(`https://smart-job-portal.onrender.com/api/upload-csv`, {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();
          if (response.ok) {
            setIsFileUploaded(true);
            toast.success('CSV imported to MongoDB successfully!');
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
    navigate('/home');
  };

  return (
    <div className="welcome-container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Loading, please wait...</p>
        </div>
      )}

      <div className="main-content">
        <div className='shadow-lg' style={{ float: 'left' }}>
          <SiProcessingfoundation fontSize={50} color="grey" />
        </div>
        <h1 className="welcome-title">Welcome to Smart Click to Job Opportunity...!</h1>
        <p className="p-2">🌟<i>“Your dream job is just one click away - explore opportunities and take the next step in your career today!”</i></p>

        <div className="buttons-container">
          <div className="button-group">
            <button
              className={`action-button ${!isFileUploaded ? 'disabled' : ''}`}
              onClick={handleSendEmails}
              disabled={!isFileUploaded}
            >
              <GoZap color="yellow" size={23} /> Good to GO..! <TbPlayerTrackNextFilled fontSize={20} />
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

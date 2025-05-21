import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Success.css';

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <div className="success-content">
        <div className="success-icon">✨</div>
        <h1 className="success-title">Success!</h1>
        <p className="success-message">
          Congratulations! Your job applications have been sent successfully.
        </p>
        
        <div className="motivation-message">
          <h2>Keep Moving Forward!</h2>
          <p>
            "Success is not final, failure is not fatal: it is the courage to continue that counts."
          </p>
          <ul className="success-tips">
            <li>Stay positive and confident</li>
            <li>Follow up on your applications</li>
            <li>Continue improving your skills</li>
            <li>Network and connect with professionals</li>
          </ul>
        </div>

        <div className="success-buttons">
          <button 
            className="success-button home"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
          <button 
            className="success-button new"
            onClick={() => navigate('/home')}
          >
            Send More Applications
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
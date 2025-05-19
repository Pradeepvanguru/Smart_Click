import React from "react";
import EmailForm from "../components/EmailForm";
import { SiProcessingfoundation } from "react-icons/si"; 
import {useNavigate} from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();


   const handleBack = () => {
    navigate("/");
  }
  
  return (
    <div className="app-container d-flex  flex-grow-1 flext-row">
    <p style={{cursor:"pointer"}} onClick={()=>{handleBack()}}><SiProcessingfoundation  fontSize={50} color="grey"/></p>
      <h4>Send Your Application To HR's or Referral Contacts through Smart Click</h4>
      <EmailForm />
    </div>
  );
};

export default Home;

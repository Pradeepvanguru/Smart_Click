import React, { useState, useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { RiSendPlaneFill } from "react-icons/ri";
import { IoMdArrowBack } from "react-icons/io";

import "./EmailForm.css";

const EmailForm = () => {
  const [subject, setSubject] = useState("");
  const [template, setTemplate] = useState(` <html>
    <body style="font-family: Arial, sans-serif; font-size: 10px; line-height: 1.5; color:grey;">
      <center><i><u>Example Email Template:</u></i></center>
      <p>Dear <strong>[HR name]</strong>,</p>
      <p>I hope this message finds you well.</p>
      <p>My name is [name], and I am very interested in applying for the <strong>[title]</strong> position at <strong>[company]</strong>. I came across the job posting and believe my skills and experience make me a strong candidate.</p>
      <p>I am excited about the opportunity to contribute to <strong>[company]</strong> and would love to discuss how I can add value to your team. Please find my resume attached for your review.</p>
      <p>Thank you for considering my application. I look forward to the possibility of discussing this opportunity further.</p>
      <p>Best regards,<br>
        [name]<br>
        [location]<br>
        [email address]<br>
        [phone number]
      </p>
    </body></html>`);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [email, setEmail] = useState("");
  const [keys, setKeys] = useState([]);

  const navigate = useNavigate();
  const progressIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const editorInstance = useRef(null);
  const collectionName = sessionStorage.getItem("collectionName");

  useEffect(() => {
    if (!collectionName) {
      toast.error("Collection name not found in session storage.");
      return;
    }

    const token = sessionStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setEmail(decoded.email);
    }

    fetch(`${process.env.REACT_APP_URI}/api/email/keys?collectionName=${collectionName}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setKeys(data.keys || []))
      .catch((err) => console.error("Error fetching keys:", err));
  }, [collectionName]);

  useEffect(() => {
    if (timer === 0 && loading) {
      clearInterval(progressIntervalRef.current);
      clearInterval(countdownIntervalRef.current);
      setLoading(false);
      setShowOverlay(false);
     
      
    }
  }, [timer, loading]);

  const handleUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("token");
    if (!token) return toast.error("Please login first.");
    if (!file) return toast.warning("Please upload a resume file.");

    setLoading(true);
    setShowOverlay(true);
    setProgress(0);
   

    const formData = new FormData();
    formData.append("email", email);
    formData.append("subject", subject);
    formData.append("template", template);
    formData.append("resume", file);
    formData.append("collectionName", collectionName);

    try {
      const res = await fetch(`${process.env.REACT_APP_URI}/api/email/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Email sending failed.");

      const estTime = parseInt(data.estimatedTime); // in seconds
      setTimer(estTime);

      // Start Progress Bar
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + (100 / estTime);
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 1000);

      // Start Countdown
      countdownIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast.success(data.message);
      navigate("/home");
 
    } catch (err) {
      toast.error(err.message || "Failed to send.");
      setLoading(false);
      setShowOverlay(false);
    }
  };

  const handleCancel = async () => {
    await fetch(`${process.env.REACT_APP_URI}/api/email/cancel`, { method: "POST" });

    setLoading(false);
    setShowOverlay(false);
    setProgress(0);
    setTimer(0);

    clearInterval(progressIntervalRef.current);
    clearInterval(countdownIntervalRef.current);
    navigate("/home");
  };

  const handleKeyInsert = (key) => {
    const editor = editorInstance.current;
    if (!editor) return;

    const insertText = `[${key}]`;
    const viewFragment = editor.data.processor.toView(insertText);
    const modelFragment = editor.data.toModel(viewFragment);

    editor.model.insertContent(modelFragment, editor.model.document.selection);
    editor.editing.view.focus();
  };

  const handleBack = () => navigate("/");

  return (
    <div className="email_form_container">
      <div>
        <p onClick={handleBack} className="email_form_back_button">
          <IoMdArrowBack fontSize={30} color="blue" />
          <span className="ms-2 text-secondary">Back</span>
        </p>
      </div>

      <form className="email_form_main" onSubmit={handleSubmit}>
        <div className="email_form_row">
          <div className="email_form_input_box">
            <label>From:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="email_form_input_box">
            <label>Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="ex: Application for Job Title...!"
              required
            />
          </div>
        </div>

        <div>
          <label>Use Placeholders:</label>
          <i style={{ float: "right", fontSize: "10px", color: "grey" }}>
            <b>Note:</b> Case-sensitive. Use [ ] brackets if typed manually.
          </i>
          <div className="placeholders">
            {keys.map((key) => (
              <span key={key} className="placeholder-item" onClick={() => handleKeyInsert(key)}>
                + [{key}]
              </span>
            ))}
          </div>
        </div>

        <CKEditor
          editor={ClassicEditor}
          data={template}
          onReady={(editor) => {
            editorInstance.current = editor;
            editor.editing.view.change((writer) => {
              writer.setAttribute("data-placeholder", "Compose your email...", editor.editing.view.document.getRoot());
            });
          }}
          onChange={(event, editor) => setTemplate(editor.getData())}
          config={{
            licenseKey: "",
            toolbar: [
              "heading", "|", "bold", "italic", "link", "bulletedList",
              "numberedList", "blockQuote", "|", "undo", "redo"
            ],
          }}
        />

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleUpload}
          className="email_form_input_box"
        />

        <button type="submit" disabled={loading} className="email_form_submit_button">
          {loading ? <span className="email_form_loader"></span> : "Send Emails"}
          <RiSendPlaneFill fontSize={20} />
        </button>
      </form>

      {showOverlay && (
        <div className="email_form_overlay">
          <div className="email_form_overlay_content">
            <h2>Sending... Please Wait</h2>
            <div className="email_form_progress_bar_container">
              <div
                className="email_form_progress_bar"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p>{Math.floor(progress)}% Completed</p>
            <p>Estimated Time Remaining: {timer} sec</p>
            <button className="email_form_cancel_button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailForm;

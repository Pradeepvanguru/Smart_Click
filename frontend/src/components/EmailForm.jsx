
import { RiSendPlaneFill } from "react-icons/ri"; 
import { IoMdArrowBack } from "react-icons/io";
import React, { useState, useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";
import "./EmailForm.css"; // Custom styles
import { useNavigate } from "react-router-dom";

const EmailForm = () => {
  const [subject, setSubject] = useState("");
  const [template, setTemplate] = useState(`<b>Example Email Template:</b><br></br>
    <html>
  <body style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; color: grey;">

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
  const [timer, setTimer] = useState(30);
  const [showOverlay, setShowOverlay] = useState(false);
  const [email, setEmail] = useState("");
  const [keys, setKeys] = useState([]);
  const navigate = useNavigate();

  const progressIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const collectionName = localStorage.getItem("collectionName");

  useEffect(() => {
    if (!collectionName) {
      toast.error("Collection name not found in local storage");
      return;
    }

    fetch(`https://smart-job-portal.onrender.com/api/email/keys?collectionName=${collectionName}`)
      .then((res) => res.json())
      .then((data) => setKeys(data.keys))
      .catch((err) => console.error("Error fetching keys:", err));
  }, [collectionName]);

  useEffect(() => {
    return () => {
      clearInterval(progressIntervalRef.current);
      clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const handleUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.warning("Please upload a resume file before sending.");
      return;
    }

    setLoading(true);
    setShowOverlay(true);
    setProgress(0);
    setTimer(10);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("subject", subject);
    formData.append("template", template);
    formData.append("resume", file);
    formData.append("collectionName", collectionName);

    try {
      const response = await fetch(`https://smart-job-portal.onrender.com/api/email/send`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const estTime = data.estimatedTime || 30;
      setTimer(estTime);

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressIntervalRef.current);
            return 100;
          }
          return prev + 100 / estTime;
        });
      }, 1000);

      countdownIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 0) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      await new Promise((resolve) => setTimeout(resolve, estTime * 1000));

      setLoading(false);
      setShowOverlay(false);
      setProgress(100);
      toast.success("Emails sent successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to send emails. Please try again.");
      setLoading(false);
      setShowOverlay(false);
    } finally {
      clearInterval(progressIntervalRef.current);
      clearInterval(countdownIntervalRef.current);
    }
  };

  const handleCancel = async () => {
    await fetch(`https://smart-job-portal.onrender.com/api/email/cancel`, { method: "POST" });

    setLoading(false);
    setShowOverlay(false);
    setProgress(0);
    setTimer(30);

    clearInterval(progressIntervalRef.current);
    clearInterval(countdownIntervalRef.current);
  };

  // Insert placeholder text at cursor position in CKEditor content
  const handleKeyInsert = (key) => {
  const editor = editorInstance.current;
  if (!editor) return;

  const insertText = `[${key}]`;
  const viewFragment = editor.data.processor.toView(insertText);
  const modelFragment = editor.data.toModel(viewFragment);

  editor.model.insertContent(modelFragment, editor.model.document.selection);
  editor.editing.view.focus();
};


  // CKEditor instance reference
  const editorInstance= useRef(null);

  const handleBack = () => {
      navigate("/");
    }

  return (
    <div className="email-form-container">
    
      <div>
        <p onClick={()=>handleBack()} >
          <IoMdArrowBack fontSize={30} color="blue" />
        </p>
      </div>
      <form className="email-form" onSubmit={handleSubmit}>
        <div className="row">
          <div className="input-box">
            <label>From:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-box ">
            <label>Subject:</label>
            <input
              
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="ex:Application for Job Title...!"
              required
            />
          </div>
        </div>

        <label>Use Placeholders:</label>
        <p style={{ float: "right" }}>
          <i>
            <b>Note:</b> It is case sensitive. Do not change the cases when adding to the email. Use [ ] brackets only in manually.
          </i>
        </p>
        <div className="placeholders">
          {keys.map((key) => (
            <span key={key} className="placeholder-item" onClick={() => handleKeyInsert(key)}>
              + [{key}]
            </span>
          ))}
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

          onChange={(event, editor) => {
            const data = editor.getData();
            setTemplate(data);
          }}
          config={{
            toolbar: [
              "heading",
              "|",
              "bold",
              "italic",
              "link",
              "bulletedList",
              "numberedList",
              "blockQuote",
              "|",
              "undo",
              "redo",
            ],
          }}
        />

        <input type="file" accept=".pdf,.docx" onChange={handleUpload} className="input-box " />

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? <span className="loader"></span> : "Send Emails"}<RiSendPlaneFill  fontSize={20}  />
        </button>
      </form>

      {showOverlay && (
        <div className="overlay">
          <div className="overlay-content">
            <h2>Sending... Please Wait</h2>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            <p>{Math.floor(progress)}% Completed</p>
            <p>Estimated Time: {timer} sec</p>
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailForm;

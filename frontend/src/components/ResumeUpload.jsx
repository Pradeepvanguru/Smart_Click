import React, { useState } from "react";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);

  const handleUpload = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {file && <p>{file.name}</p>}
    </div>
  );
};

export default ResumeUpload;

import axios from "axios";

const API_URL = `${process.env.React_URI}/api/email/send`;

export const sendEmail = async (formData) => {
  return await axios.post(API_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

import React, { useState } from "react";
import style from "../assets/styleSheets/Login.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    const response = await fetch(
      "https://stark-harbor-79359-9d7adf515fd1.herokuapp.com/forgot-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );
    const data = await response.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className={style.loginPage}>
      <div className={style.loginCard}>
        <h2>Reset Password</h2>
        <p>Enter your email address to receive a reset link.</p>
        {message && <div className={style.alert}>{message}</div>}
        <input
          type="email"
          className={style.formControl}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className={style.btnLogin} onClick={handleSubmit}>
          Send Link
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;

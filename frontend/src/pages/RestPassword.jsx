import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import style from "../assets/styleSheets/Login.module.css";

const ResetPassword = () => {
  const { reset_id } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
    const response = await fetch(
      `http://127.0.0.1:5000/reset-password/${reset_id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      },
    );

    if (response.ok) {
      alert("Password changed! Please login.");
      navigate("/");
    } else {
      const data = await response.json();
      setMessage(data.error);
    }
  };

  return (
    <div className={style.loginPage}>
      <div className={style.loginCard}>
        <h2>Set New Password</h2>
        {message && <div className={style.alert}>{message}</div>}
        <input
          type="password"
          className={style.formControl}
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className={style.btnLogin} onClick={handleReset}>
          Update Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;

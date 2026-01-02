import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "assets/styleSheets/login.css";

const API_URL = "http://127.0.0.1:5000";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token);
    }
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        redirectDashboard(data.user.role); 
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError(
        "Connection error. Please check if the backend server is running."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/verify-token`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.valid && data.user) {
        redirectDashboard(data.user.role);
      } else {
        logout();
      }
    } catch (err) {
      console.error(err);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const redirectDashboard = (role) => {
    switch (role) {
      case "admin":
        navigate("/admin");
        break;
      case "doctor":
        navigate("/doctor");
        break;
      case "nurse":
        navigate("/nurse");
        break;
      case "parent":
        navigate("/parent");
        break;
      default:
        navigate("/");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div id="loginSection" className="container-wrapper">
      <div className="logo-section">
        <a href="http://bambinoo.net/">
          <h1 className="logo-title">Bambinoo</h1>
        </a>
        <p className="logo-subtitle">
          Digital Child Health and Development Record
        </p>
      </div>

      <div className="login-card">
        <h2 className="login-title">Sign In</h2>
        <p className="login-subtitle">Sign in to access your CHDR account</p>

        {error && (
          <div className="alert" role="alert">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            required
            aria-label="username"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            required
            aria-label="Password"
          />
        </div>

        <button
          type="button"
          className="btn-login"
          onClick={handleLogin}
          disabled={loading}
          aria-label="Sign In Button"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <div className="footer-text">
          <p>
            <a href="#">Forget Password?</a> Reset your password <br />
            <a href="Patient_Registration.html">Don't have an account?</a> Visit
            your nearest clinic.
          </p>
          <a href="http://bambinoo.net/" className="footer-link">
            Learn more about Bambinoo
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
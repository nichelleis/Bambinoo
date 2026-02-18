import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import style from "./assets/styleSheets/Login.module.css";
import logo from "./assets/images/site icon.png";
import { Link } from "react-router-dom";

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
        localStorage.setItem("user", JSON.stringify(data.user));
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
        localStorage.setItem("user", JSON.stringify(data.user));
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
    navigate("/", { replace: true });
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
    <div className={style.loginPage}>
      <div id="loginSection" className={style.containerWrapper}>
        <div className={style.logoSection}>
          <a href="http://bambinoo.net/">
            <img src={logo} alt="Bambinoo Logo" className={style.logoImage} />
            <h1 className={style.logoTitle}>Bambinoo</h1>
          </a>
          <p className={style.logoSubtitle}>
            Sri Lanka Digital Child Health and Development Record
          </p>
        </div>

        <div className={style.loginCard}>
          <h2 className={style.loginTitle}>Sign In</h2>
          <p className={style.loginSubtitle}>
            Sign in to access your CHDR account
          </p>

          {error && (
            <div className={style.alert} role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="username" className={style.formLabel}>
              Username
            </label>
            <input
              type="text"
              className={style.formControl}
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
            <label htmlFor="password" className={style.formLabel}>
              Password
            </label>
            <input
              type="password"
              className={style.formControl}
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
            className={style.btnLogin}
            onClick={handleLogin}
            disabled={loading}
            aria-label="Sign In Button"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className={style.footerText}>
            <p>
              <a href="#">Forget Password?</a> Reset your password <br />
              <Link to="/register">
                Don't have an account?
              </Link>
              Visit your nearest clinic.
            </p>
            <a href="http://bambinoo.net/" className={style.footerLink}>
              Learn more about Bambinoo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

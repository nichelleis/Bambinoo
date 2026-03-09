import style from "../../assets/styleSheets/ParentDashboard.module.css";
import { NavLink } from "react-router-dom";
import React, { useEffect, useState } from "react";

function SideNav() {
  const [childGender, setChildGender] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/header", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setChildGender(data.gender))
      .catch(console.error);
  }, []);

  const menuItems = [
    { name: "Home", path: "/parent", icon: "bi-house-door-fill" },
    { name: "Analytics", path: "/parent/analytics", icon: "bi-graph-up" },
    { name: "Milestones", path: "/parent/milestones", icon: "bi-trophy-fill" },
    { name: "AI Analytics", path: "/parent/ai-analytics", icon: "bi-robot" },
    { name: "Education", path: "/parent/education", icon: "bi-book-half" },
    {
      name: "Message Doctor",
      path: "/parent/message-doctor",
      icon: "bi-chat-dots-fill",
    },
  ];
  return (
    <nav className={style.mainMenu}>
      <div className={style.area}>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                end={item.name === "Home"}
                className={({ isActive }) => (isActive ? "active" : "")}
                style={({ isActive }) =>
                  isActive
                    ? {
                        backgroundColor:
                          childGender === "Male" ? "#4A90E2" : "#f576b5ff",
                        color: "white",
                        fontWeight: "bold",
                        width: "180px",
                      }
                    : {}
                }
              >
                <i
                  className={`bi ${item.icon}`}
                  style={{
                    color: childGender ? "white" : undefined,
                    paddingLeft: "21px",
                    paddingRight: "20px",
                  }}
                ></i>
                <span className={style.navText}>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <ul className={style.logout}>
          <li>
            <button
              className={style.logoutButton}
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/";
              }}
            >
              <i className="bi bi-box-arrow-left"></i>
              <span className={style.navTextLogout}>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default SideNav;

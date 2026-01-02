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
    { name: "Analytics", path: "/analytics", icon: "bi-graph-up" },
    { name: "Milestones", path: "/milestones", icon: "bi-trophy-fill" },
    { name: "AI Analytics", path: "/ai-analytics", icon: "bi-robot" },
    { name: "Education", path: "/education", icon: "bi-book-half" },
    {
      name: "Message Doctor",
      path: "/message-doctor",
      icon: "bi-chat-dots-fill",
    },
    { name: "More", path: "/more", icon: "bi-three-dots" },
  ];

  return (
    <nav className={style.mainMenu}>
      <div className={style.area}>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
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
            <NavLink to="/logout">
              <i className="bi bi-box-arrow-left"></i>
              <span className={style.navText}>Logout</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default SideNav;

import style from "../../assets/styleSheets/ParentDashboard.module.css";

function SideNav() {
  const menuItems = [
    { name: "Home", icon: "bi-house-door-fill" },
    { name: "Analytics", icon: "bi-graph-up" },
    { name: "Milestones", icon: "bi-trophy-fill" },
    { name: "AI Analytics", icon: "bi-robot" },
    { name: "Education", icon: "bi-book-half" },
    {
      name: "Message Doctor",
      icon: "bi-chat-dots-fill",
    },
    { name: "More", icon: "bi-three-dots" },
  ];

  return (
    <nav className={style.mainMenu}>
      <div className={style.area}>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <i className={`bi ${item.icon}`}></i>
              <span className="nav-text">{item.name}</span>
            </li>
          ))}
        </ul>

        <ul className={style.logout}>
          <li>
            <i className="bi bi-box-arrow-left"></i>
            <span className={style.navText}>Logout</span>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default SideNav;

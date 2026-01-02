import Home from "../parent/Pages/home";
import style from "../assets/styleSheets/ParentDashboard.module.css";


function AdminLayout() {
  return (
    <div className={style.body}>
      <Home />

      {/* Temporary logout */}
      <Logout />
    </div>

  );
}

export default AdminLayout;

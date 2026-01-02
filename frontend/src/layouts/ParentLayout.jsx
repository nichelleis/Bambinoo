import Home from "../parent/Pages/home";
import style from "../assets/styleSheets/ParentDashboard.module.css";

function ParentLayout() {
  return (
    <div className={style.body}>
      <Home />
    </div>
  );
}

export default ParentLayout;

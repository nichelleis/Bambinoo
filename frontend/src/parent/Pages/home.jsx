import DashboardHeader from "../Components/DashBoardHeader";
import DashboardNav from "../Components/DashboardNav";
import Overview from "../Components/OverviewComponent";

function Home() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-8 mb-4">
          <Overview />
        </div>
      </div>
    </div>
  );
}

export default Home;

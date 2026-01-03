import DashboardHeader from "../Components/DashBoardHeader";
import DashboardNav from "../Components/DashboardNav";
import Overview from "../Components/OverviewComponent";
import UpcomingEvent from "../Components/UpcomingEventComponent";

function Home() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-8 mb-4">
          <Overview />
        </div>
        <div className="col-md-8 mb-4">
          <UpcomingEvent />
        </div>
      </div>
    </div>
  );
}

export default Home;

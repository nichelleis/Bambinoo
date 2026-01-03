import DashboardHeader from "../Components/DashBoardHeader";
import DashboardNav from "../Components/DashboardNav";
import Overview from "../Components/OverviewComponent";
import UpcomingEvent from "../Components/UpcomingEventComponent";
import DevelopmentMilestonesCard from "../Components/MilestoneSummary";

function Home() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-8 mb-4">
          <Overview />
        </div>
        <div className="col-md-4 mb-4">
          <UpcomingEvent />
        </div>
      </div>
      <div className="row">
        <div className="col-md-4 mb-4">
          <DevelopmentMilestonesCard />
        </div>
        <div className="col-md-4 mb-4">
          <DevelopmentMilestonesCard />
        </div>
        <div className="col-md-4 mb-4">
          <DevelopmentMilestonesCard />
        </div>
      </div>
    </div>
  );
}

export default Home;

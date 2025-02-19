import ACTrackerLanding from '@/ac-components/Pages/LandingPage';
import { Helmet } from '@modern-js/runtime/head';

const Index = () => (
  <div className="container-box">
    <Helmet>
      <title>ACTracker - Your Habits as a service</title>
    </Helmet>
    <ACTrackerLanding />
  </div>
);

export default Index;

import ACTrackerLanding from '@/ac-components/LandingPage';
import { Helmet } from '@modern-js/runtime/head';

const Index = () => (
  <div className="container-box">
    <Helmet>
      <title>ACTracker - Your Habits as a service</title>
      <link
        rel="icon"
        type="image/x-icon"
        href="https://lf3-static.bytednsdoc.com/obj/eden-cn/uhbfnupenuhf/favicon.ico"
      />
    </Helmet>
    <ACTrackerLanding />
  </div>
);

export default Index;

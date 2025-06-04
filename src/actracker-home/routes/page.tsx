import DaystackLanding from '@/ac-components/Pages/LandingPage';
import { Helmet } from '@modern-js/runtime/head';

const Index = () => (
  <div className="container-box">
    <Helmet>
      <title>Routini - Plugin Feed for your daily routine</title>
    </Helmet>
    <DaystackLanding />
  </div>
);

export default Index;

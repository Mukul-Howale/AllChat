// The main entry page of the application, rendering the VideoChat component.
import React from 'react';
import LandingPage from '../components/LandingPage';
import VideoChat from '../components/VideoChat';

const Home: React.FC = () => {
  return (
    <div>
      <LandingPage />
      {/* <VideoChat /> */}
    </div>
  );
};

export default Home;

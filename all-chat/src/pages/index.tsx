// The main entry page of the application, rendering the VideoChat component.
import React from 'react';
import VideoChat from '../components/VideoChat';

const Home: React.FC = () => {
  return (
    <div>
      {/* Render the VideoChat component */}
      <VideoChat />
    </div>
  );
};

export default Home;

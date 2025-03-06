import React from 'react';
import videoFile from '../../assets/videoplayback.mp4';
import "./Video.css";

const Video = () => {
  return (
    <div className="video-container">
      <div className="video-wrapper">
        <video autoPlay muted loop controls>
          <source src={videoFile} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

export default Video;

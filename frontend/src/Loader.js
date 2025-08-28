import React from 'react';
import './Loader.css';
import loadingGif from './images/loading.gif'; // Place your GIF in this path

function Loader({ isVisible = true, loadingText = "Loading.." }) {
  if (!isVisible) return null;

  return (
    <div className="minimal-loader-overlay">
      <div className="minimal-loader-container">
        <img src={loadingGif} alt="Loading" className="minimal-loader-gif" />
        <div className="minimal-loading-text">{loadingText}</div>
      </div>
    </div>
  );
}

export default Loader;
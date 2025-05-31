
"use client";

import React from 'react';
import './rotating-cube.css'; // We'll create this CSS file

const RotatingCube = () => {
  return (
    <div className="cube-viewport">
      <div className="cube-container">
        <div className="cube">
          <div className="face front"></div>
          <div className="face back"></div>
          <div className="face right"></div>
          <div className="face left"></div>
          <div className="face top"></div>
          <div className="face bottom"></div>
        </div>
      </div>
    </div>
  );
};

export default RotatingCube;

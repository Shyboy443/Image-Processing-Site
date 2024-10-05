import React, { useState } from "react";

const Segmentation = ({
  setSegmentation,
  segmentation,
  setEdgeDetection,
  edgeDetection,
  emboss,
  setEmboss,
}) => {
  const handleSegmentationToggle = () => {
    setSegmentation(!segmentation);
  };

  const handleEmbossToggle = () => {
    setEmboss(!emboss);
  };

  const handleEdgeDetectionToggle = () => {
    setEdgeDetection(!edgeDetection);
  };

  return (
    <div>
      <button onClick={handleSegmentationToggle} style={{ margin: ".5rem" }}>
        {segmentation ? "Disable Segmentation" : "Enable Segmentation"}
      </button>

      <button onClick={handleEmbossToggle} style={{ margin: ".5rem" }}>
        {emboss ? "Disable Emboss Filter" : "Enable Emboss Filter"}
      </button>

      <button onClick={handleEdgeDetectionToggle} style={{ margin: ".5rem" }}>
        {edgeDetection
          ? "Disable Edge Detection Filter"
          : "Enable Edge Detection Filter"}
      </button>
    </div>
  );
};

export default Segmentation;

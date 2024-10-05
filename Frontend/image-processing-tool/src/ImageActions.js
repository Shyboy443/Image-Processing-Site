import React, { useState, useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

const ImageActions = ({
  liveViewImage,
  setLiveViewImage,
  rotation,
  setRotation,
  crop,
  setCrop,
  flip,
  setFlip,
  setCropWidth, // Add these props
  setCropHeight, // Add these props
  cropWidth, // Add these props
  cropHeight, // Add these props
}) => {
  const cropperRef = useRef(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const handleRotationChange = (value) => {
    setRotation(value);
  };

  const handleCrop = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const cropper = cropperRef.current.cropper;

      // Get the cropped canvas
      const croppedCanvas = cropper.getCroppedCanvas();

      if (croppedCanvas) {
        const croppedImageData = croppedCanvas.toDataURL();
        setCropWidth(croppedCanvas.width); // Save cropped width
        setCropHeight(croppedCanvas.height); // Save cropped height

        // Update the live view with the cropped image
        setLiveViewImage(croppedImageData);

        setShowCropModal(false);
      } else {
        console.error("Error: Cropped canvas is null.");
      }
    } else {
      console.error("Error: Cropper instance is not available.");
    }
  };

  return (
    <div className="image-actions-container">
      <div>
        <label htmlFor="flip">Flip:</label>
        <select
          id="flip"
          value={flip}
          onChange={(e) => setFlip(e.target.value)}
        >
          <option value="">None</option>
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </select>
      </div>
      <label>Rotate: </label>
      <input
        type="range"
        min="0"
        max="360"
        value={rotation}
        onChange={(e) => handleRotationChange(e.target.value)}
      />
      <span>{rotation}°</span>
      <div>
        <label htmlFor="cropToggle">Crop:</label>
        <input
          type="checkbox"
          id="cropToggle"
          checked={crop}
          onChange={() => {
            setCrop(!crop);
            if (!crop) {
              setShowCropModal(true);
            }
          }}
        />
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="modal-overlay" onClick={() => setShowCropModal(false)}>
          <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Crop Image</h3>
            {liveViewImage && (
              <Cropper
                src={liveViewImage}
                style={{ height: 400, width: "100%" }}
                aspectRatio={16 / 9} // Adjust this ratio as needed
                guides={false}
                ref={cropperRef}
              />
            )}
            <button onClick={handleCrop}>Crop</button>
            <button onClick={() => setShowCropModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageActions;

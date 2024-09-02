import React, { useState, useEffect } from "react";

function ImageUploader() {
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [liveViewImage, setLiveViewImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [brightness, setBrightness] = useState(1);
  const [colorMode, setColorMode] = useState("color");
  const [flip, setFlip] = useState("");
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [lightness, setLightness] = useState(1);
  const [crop, setCrop] = useState(false);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);

  useEffect(() => {
    if (originalImage) {
      updateLiveView();
    }
  }, [
    brightness,
    colorMode,
    flip,
    hue,
    saturation,
    lightness,
    crop,
    cropWidth,
    cropHeight,
    originalImage,
  ]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage(reader.result);
      setLiveViewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const updateLiveView = () => {
    if (!originalImage) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = new Image();

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;

      ctx.filter = `brightness(${brightness}) hue-rotate(${hue}deg) saturate(${saturation})`;
      ctx.drawImage(image, 0, 0);

      if (flip === "horizontal") {
        ctx.scale(-1, 1);
        ctx.drawImage(image, -image.width, 0);
      } else if (flip === "vertical") {
        ctx.scale(1, -1);
        ctx.drawImage(image, 0, -image.height);
      }

      if (crop && cropWidth > 0 && cropHeight > 0) {
        const cropX = (canvas.width - cropWidth) / 2;
        const cropY = (canvas.height - cropHeight) / 2;
        const croppedImage = ctx.getImageData(
          cropX,
          cropY,
          cropWidth,
          cropHeight
        );
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        ctx.putImageData(croppedImage, 0, 0);
      }

      setLiveViewImage(canvas.toDataURL());
    };

    image.src = originalImage;
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("brightness", brightness);
    formData.append("color_mode", colorMode);
    formData.append("flip", flip);
    formData.append("hue", hue);
    formData.append("saturation", saturation);
    formData.append("lightness", lightness);
    formData.append("crop", crop);
    formData.append("crop_width", cropWidth);
    formData.append("crop_height", cropHeight);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setMessage(data.message);
      setProcessedImage(`data:image/png;base64,${data.image}`);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="container">
      <h1>Image Processing Tool</h1>
      <div className="file-upload-container">
        <input
          type="file"
          id="fileInput"
          className="file-input"
          onChange={handleFileChange}
        />
        <label htmlFor="fileInput" className="file-label">
          Choose a file
        </label>
      </div>

      <div className="controls-preview-container">
        <div className="left-controls">
          <div>
            <label htmlFor="brightness">Brightness: {brightness}</label>
            <input
              type="range"
              id="brightness"
              min="0.5"
              max="3"
              step="0.1"
              value={brightness}
              onChange={(e) => setBrightness(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="hue">Hue: {hue}</label>
            <input
              type="range"
              id="hue"
              min="-180"
              max="180"
              step="1"
              value={hue}
              onChange={(e) => setHue(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="saturation">Saturation: {saturation}</label>
            <input
              type="range"
              id="saturation"
              min="0"
              max="2"
              step="0.1"
              value={saturation}
              onChange={(e) => setSaturation(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="lightness">Lightness: {lightness}</label>
            <input
              type="range"
              id="lightness"
              min="0.5"
              max="2"
              step="0.1"
              value={lightness}
              onChange={(e) => setLightness(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="colorMode">Color Mode:</label>
            <select
              id="colorMode"
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value)}
            >
              <option value="color">Color</option>
              <option value="grayscale">Grayscale</option>
              <option value="bw">Black & White</option>
            </select>
          </div>
        </div>

        <div className="live-view-container">
          <h2>Live View:</h2>
          {liveViewImage ? (
            <img
              src={liveViewImage}
              alt="Live View"
              className="live-view-image"
            />
          ) : (
            <div className="placeholder">No Image Selected</div>
          )}
        </div>

        <div className="right-controls">
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
          <div>
            <label htmlFor="cropToggle">Crop:</label>
            <input
              type="checkbox"
              id="cropToggle"
              checked={crop}
              onChange={() => setCrop(!crop)}
            />
          </div>
          {crop && (
            <div>
              <label htmlFor="cropWidth">Crop Width:</label>
              <input
                type="number"
                id="cropWidth"
                value={cropWidth}
                onChange={(e) => setCropWidth(e.target.value)}
              />
              <label htmlFor="cropHeight">Crop Height:</label>
              <input
                type="number"
                id="cropHeight"
                value={cropHeight}
                onChange={(e) => setCropHeight(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <button onClick={handleUpload}>Upload</button>
      {message && <p>{message}</p>}

      <div className="image-container">
        <div className="image-section">
          <h2>Original Image:</h2>
          {originalImage ? (
            <img src={originalImage} alt="Original" className="image" />
          ) : (
            <div className="placeholder">No Image Uploaded</div>
          )}
        </div>

        <div className="image-section">
          <h2>Image After Processing:</h2>
          {processedImage ? (
            <img src={processedImage} alt="Processed" className="image" />
          ) : (
            <div className="placeholder">No Image Processed</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageUploader;

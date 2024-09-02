import React, { useState } from "react";

function ImageUploader() {
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    // Create a URL for the selected file to preview it
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleBrightnessChange = (e) => {
    setBrightness(e.target.value);
  };

  const handleColorModeChange = (e) => {
    setColorMode(e.target.value);
  };

  const handleFlipChange = (e) => {
    setFlip(e.target.value);
  };

  const handleHueChange = (e) => {
    setHue(e.target.value);
  };

  const handleSaturationChange = (e) => {
    setSaturation(e.target.value);
  };

  const handleLightnessChange = (e) => {
    setLightness(e.target.value);
  };

  const handleCropToggle = () => {
    setCrop(!crop);
  };

  const handleCropWidthChange = (e) => {
    setCropWidth(e.target.value);
  };

  const handleCropHeightChange = (e) => {
    setCropHeight(e.target.value);
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
    <div>
      <h1>Image Processing Tool</h1>
      <input type="file" onChange={handleFileChange} />
      <div>
        <label htmlFor="brightness">Brightness: {brightness}</label>
        <input
          type="range"
          id="brightness"
          min="0.5"
          max="3"
          step="0.1"
          value={brightness}
          onChange={handleBrightnessChange}
        />
      </div>
      <div>
        <label htmlFor="colorMode">Color Mode:</label>
        <select
          id="colorMode"
          value={colorMode}
          onChange={handleColorModeChange}
        >
          <option value="color">Color</option>
          <option value="grayscale">Grayscale</option>
          <option value="bw">Black & White</option>
        </select>
      </div>
      <div>
        <label htmlFor="flip">Flip:</label>
        <select id="flip" value={flip} onChange={handleFlipChange}>
          <option value="">None</option>
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </select>
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
          onChange={handleHueChange}
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
          onChange={handleSaturationChange}
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
          onChange={handleLightnessChange}
        />
      </div>
      <div>
        <label htmlFor="cropToggle">Crop:</label>
        <input
          type="checkbox"
          id="cropToggle"
          checked={crop}
          onChange={handleCropToggle}
        />
      </div>
      {crop && (
        <div>
          <label htmlFor="cropWidth">Crop Width:</label>
          <input
            type="number"
            id="cropWidth"
            value={cropWidth}
            onChange={handleCropWidthChange}
          />
          <label htmlFor="cropHeight">Crop Height:</label>
          <input
            type="number"
            id="cropHeight"
            value={cropHeight}
            onChange={handleCropHeightChange}
          />
        </div>
      )}
      <button onClick={handleUpload}>Upload</button>
      {message && <p>{message}</p>}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {originalImage && (
          <div>
            <h2>Original Image:</h2>
            <img
              src={originalImage}
              alt="Original"
              style={{ maxWidth: "45%", maxHeight: "300px" }}
            />
          </div>
        )}
        {processedImage && (
          <div>
            <h2>Processed Image:</h2>
            <img
              src={processedImage}
              alt="Processed"
              style={{ maxWidth: "45%", maxHeight: "300px" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUploader;

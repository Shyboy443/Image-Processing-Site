import React, { useState, useEffect } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

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
  const [strength, setStrength] = useState(1); // State for strength control
  const [tonalRange, setTonalRange] = useState(1);
  const [gamma, setGamma] = useState(1);
  const [red, setRed] = useState(1); // State for Red channel
  const [green, setGreen] = useState(1); // State for Green channel
  const [blue, setBlue] = useState(1); // State for Blue channel
  const [showRgbModal, setShowRgbModal] = useState(false);
  const resetBrightness = () => setBrightness(1);
  const resetHue = () => setHue(0);
  const resetSaturation = () => setSaturation(1);
  const resetLightness = () => setLightness(1);
  const resetTonalRange = () => setTonalRange(1);
  const resetGamma = () => setGamma(1);
  const resetRed = () => setRed(1);
  const resetGreen = () => setGreen(1);
  const resetBlue = () => setBlue(1);
  const resetTone = () => {
    setMinTone(0);
    setMaxTone(255);
  };

  const [minTone, setMinTone] = useState(0);
  const [maxTone, setMaxTone] = useState(255);

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
    tonalRange,
    gamma,
    red,
    green,
    blue,
    minTone,
    maxTone,
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

      // Combine applied filters based on their current values
      ctx.filter = `
            brightness(${brightness})
            hue-rotate(${hue}deg)
            saturate(${saturation})
            brightness(${lightness})
            contrast(${tonalRange})
        `.trim();

      ctx.drawImage(image, 0, 0);

      // Apply gamma correction
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply RGB adjustments
      for (let i = 0; i < data.length; i += 4) {
        data[i] *= red; // Adjust Red channel
        data[i + 1] *= green; // Adjust Green channel
        data[i + 2] *= blue; // Adjust Blue channel
      }

      // Apply tonal range adjustments
      for (let i = 0; i < data.length; i += 4) {
        data[i] = adjustTone(data[i]);
        data[i + 1] = adjustTone(data[i + 1]);
        data[i + 2] = adjustTone(data[i + 2]);
      }

      const gammaCorrection = 1 / gamma;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 * Math.pow(data[i] / 255, gammaCorrection);
        data[i + 1] = 255 * Math.pow(data[i + 1] / 255, gammaCorrection);
        data[i + 2] = 255 * Math.pow(data[i + 2] / 255, gammaCorrection);
      }

      ctx.putImageData(imageData, 0, 0);

      // Handle flipping
      if (flip === "horizontal") {
        ctx.scale(-1, 1);
        ctx.drawImage(image, -image.width, 0);
      } else if (flip === "vertical") {
        ctx.scale(1, -1);
        ctx.drawImage(image, 0, -image.height);
      }

      // Handle cropping
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
  const adjustTone = (value) => {
    return Math.min(
      Math.max(((value - minTone) / (maxTone - minTone)) * 255, 0),
      255
    );
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("image", image);
    formData.append(
      "brightness",
      brightness !== 1 ? brightness * strength : brightness
    );
    formData.append("min_tone", minTone);
    formData.append("max_tone", maxTone);
    formData.append("color_mode", colorMode);
    formData.append("flip", flip);
    formData.append("hue", hue !== 0 ? hue * strength : hue);
    formData.append(
      "saturation",
      saturation !== 1 ? saturation * strength : saturation
    );
    formData.append(
      "lightness",
      lightness !== 1 ? lightness * strength : lightness
    );
    formData.append("tonal_range", parseFloat(tonalRange));
    formData.append("gamma", parseFloat(gamma));
    formData.append("red", parseFloat(red));
    formData.append("green", parseFloat(green));
    formData.append("blue", parseFloat(blue));
    formData.append("crop", crop);
    formData.append("crop_width", parseInt(cropWidth));
    formData.append("crop_height", parseInt(cropHeight));
    console.log("Sending data:", {
      gamma: parseFloat(gamma),
      tonal_range: parseFloat(tonalRange),
    });
    try {
      console.log("Sending data:", {
        gamma: parseFloat(gamma),
        tonal_range: parseFloat(tonalRange),
      }); // Log to check if values are correct before sending

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
            <label htmlFor="strength">Strength:</label>
            <select
              id="strength"
              value={strength}
              onChange={(e) => setStrength(parseFloat(e.target.value))}
            >
              <option value={1}>Low</option>
              <option value={1.5}>Medium</option>
              <option value={2}>High</option>
            </select>
          </div>
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
            <button className="resetbtn" onClick={resetBrightness}></button>
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
            <button className="resetbtn" onClick={resetHue}></button>
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
            <button className="resetbtn" onClick={resetSaturation}></button>
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
            <button className="resetbtn" onClick={resetLightness}></button>
          </div>
          <div>
            <label>Min Tone - Max Tone</label>
            <Slider
              range
              min={0}
              max={255}
              step={1}
              value={[minTone, maxTone]}
              onChange={(value) => {
                setMinTone(value[0]);
                setMaxTone(value[1]);
              }}
              allowCross={false}
            />
            <div>
              <span>Min Tone: {minTone}</span>
              <span>Max Tone: {maxTone}</span>
            </div>
            <button className="resetbtn" onClick={resetTone}></button>
          </div>

          <div>
            <label htmlFor="gamma">Gamma: {gamma}</label>
            <input
              type="range"
              id="gamma"
              min="0.5"
              max="3"
              step="0.1"
              value={gamma}
              onChange={(e) => setGamma(e.target.value)}
            />
            <button className="resetbtn" onClick={resetGamma}></button>
          </div>
          <button onClick={() => setShowRgbModal(true)}>RGB Change</button>
          {/* Modal for RGB Sliders */}
          {showRgbModal && (
            <>
              <div
                className="modal-overlay"
                onClick={() => setShowRgbModal(false)}
              />
              <div className="rgb-modal">
                <h3>Adjust RGB Levels</h3>
                <div>
                  <label htmlFor="red">Red: {red}</label>
                  <input
                    type="range"
                    id="red"
                    min="0"
                    max="2"
                    step="0.1"
                    value={red}
                    onChange={(e) => setRed(e.target.value)}
                  />
                  <button className="resetbtn" onClick={resetRed}></button>
                </div>
                <div>
                  <label htmlFor="green">Green: {green}</label>
                  <input
                    type="range"
                    id="green"
                    min="0"
                    max="2"
                    step="0.1"
                    value={green}
                    onChange={(e) => setGreen(e.target.value)}
                  />
                  <button className="resetbtn" onClick={resetGreen}></button>
                </div>
                <div>
                  <label htmlFor="blue">Blue: {blue}</label>
                  <input
                    type="range"
                    id="blue"
                    min="0"
                    max="2"
                    step="0.1"
                    value={blue}
                    onChange={(e) => setBlue(e.target.value)}
                  />
                  <button className="resetbtn" onClick={resetBlue}></button>
                </div>
                <button onClick={() => setShowRgbModal(false)}>Close</button>
              </div>
            </>
          )}
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
              <label htmlFor="cropWidth">Width: </label>
              <input
                type="number"
                id="cropWidth"
                value={cropWidth}
                onChange={(e) => setCropWidth(e.target.value)}
              />
              <br></br>
              <label htmlFor="cropHeight">Height:</label>
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

      <button className="buttonUpload" onClick={handleUpload}>
        Process Image
      </button>
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
            <>
              <img src={processedImage} alt="Processed" className="image" />
              <a href={processedImage} download="processed-image.png">
                <button className="download-button">Download Image</button>
              </a>
            </>
          ) : (
            <div className="placeholder">No Image Processed</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageUploader;

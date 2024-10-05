import React, { useState, useEffect, useRef } from "react";
import "rc-slider/assets/index.css";
import "cropperjs/dist/cropper.css";
import ColorAdjustments from "./ColorAdjustments";
import ImageActions from "./ImageActions";
import ImageUploaderHandler from "./ImageUploadHandler"; // Import the new component
import Segmentation from "./segmentation/segmentation";

function ImageUploader() {
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [liveViewImage, setLiveViewImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [brightness, setBrightness] = useState(1);
  const [colorMode, setColorMode] = useState("color");
  const [AutocolorBalance, setAutoColorBalance] = useState("false");
  const [flip, setFlip] = useState("");
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [lightness, setLightness] = useState(1);
  const [crop, setCrop] = useState(false);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
  const [tonalRange, setTonalRange] = useState(1);
  const [gamma, setGamma] = useState(1);
  const [red, setRed] = useState(1); // State for Red channel
  const [green, setGreen] = useState(1); // State for Green channel
  const [blue, setBlue] = useState(1); // State for Blue channel
  const cropperRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const resetBrightness = () => setBrightness(1);
  const resetHue = () => setHue(0);
  const resetSaturation = () => setSaturation(1);
  const resetLightness = () => setLightness(1);
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
  const [segmentation, setSegmentation] = useState(false);
  const [emboss, setEmboss] = useState(false);
  const [edgeDetection, setEdgeDetection] = useState(false);

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
    AutocolorBalance,
    segmentation,
    emboss,
    edgeDetection,
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
  const applyColorBalance = (data, redBalance, greenBalance, blueBalance) => {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * redBalance); // Red
      data[i + 1] = Math.min(255, data[i + 1] * greenBalance); // Green
      data[i + 2] = Math.min(255, data[i + 2] * blueBalance); // Blue
    }
  };
  const updateLiveView = () => {
    if (!originalImage) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = new Image();

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;

      ctx.filter = `
        brightness(${brightness})
        hue-rotate(${hue}deg)
        saturate(${saturation})
        contrast(${tonalRange})
        brightness(${lightness})
      `.trim();
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      if (AutocolorBalance) {
        applyColorBalance(data, red, green, blue);
      }

      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * red);
        data[i + 1] = Math.min(255, data[i + 1] * green);
        data[i + 2] = Math.min(255, data[i + 2] * blue);
      }

      const adjustTone = (value) => {
        return Math.min(
          255,
          Math.max(0, ((value - minTone) / (maxTone - minTone)) * 255)
        );
      };

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

      if (emboss) {
        const embossImage = applyEmboss(data, canvas.width, canvas.height);
        ctx.putImageData(embossImage, 0, 0);
      }

      if (edgeDetection) {
        const edgesImage = applyEdgeDetection(
          data,
          canvas.width,
          canvas.height
        );
        ctx.putImageData(edgesImage, 0, 0);
      }

      // Apply segmentation if enabled
      if (segmentation) {
        applySegmentation(data, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0); // Update the canvas with segmentation changes
      }

      if (colorMode === "grayscale") {
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg; // Red
          data[i + 1] = avg; // Green
          data[i + 2] = avg; // Blue
        }
        ctx.putImageData(imageData, 0, 0);
      }

      if (flip === "horizontal") {
        const flippedCanvas = document.createElement("canvas");
        const flippedCtx = flippedCanvas.getContext("2d");
        flippedCanvas.width = canvas.width;
        flippedCanvas.height = canvas.height;
        flippedCtx.translate(flippedCanvas.width, 0);
        flippedCtx.scale(-1, 1);
        flippedCtx.drawImage(canvas, 0, 0);
        canvas.width = flippedCanvas.width;
        canvas.height = flippedCanvas.height;
        ctx.drawImage(flippedCanvas, 0, 0);
      } else if (flip === "vertical") {
        const flippedCanvas = document.createElement("canvas");
        const flippedCtx = flippedCanvas.getContext("2d");
        flippedCanvas.width = canvas.width;
        flippedCanvas.height = canvas.height;
        flippedCtx.translate(0, flippedCanvas.height);
        flippedCtx.scale(1, -1);
        flippedCtx.drawImage(canvas, 0, 0);
        canvas.width = flippedCanvas.width;
        canvas.height = flippedCanvas.height;
        ctx.drawImage(flippedCanvas, 0, 0);
      }

      setLiveViewImage(canvas.toDataURL("image/png", 1.0));
    };

    image.src = originalImage;
  };

  const applyEdgeDetection = (data, width, height) => {
    const kernel = [
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1],
    ];
    return applyKernel(data, width, height, kernel);
  };

  const applyEmboss = (data, width, height) => {
    const kernel = [
      [0, -1, -1],
      [1, 0, -1],
      [1, 1, 0],
    ];
    return applyKernel(data, width, height, kernel);
  };

  const applyKernel = (data, width, height, kernel) => {
    const result = new Uint8ClampedArray(data.length);
    const kernelSize = kernel.length;
    const kernelHalf = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0;

        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const px = x + kx - kernelHalf;
            const py = y + ky - kernelHalf;

            if (px >= 0 && px < width && py >= 0 && py < height) {
              const i = (py * width + px) * 4;
              const weight = kernel[ky][kx];
              r += data[i] * weight;
              g += data[i + 1] * weight;
              b += data[i + 2] * weight;
            }
          }
        }

        const i = (y * width + x) * 4;
        result[i] = Math.min(255, Math.max(0, r));
        result[i + 1] = Math.min(255, Math.max(0, g));
        result[i + 2] = Math.min(255, Math.max(0, b));
        result[i + 3] = data[i + 3];
      }
    }

    const imageData = new ImageData(result, width, height);
    return imageData;
  };

  const applySegmentation = (data, width, height) => {
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    // Binary thresholding for segmentation
    const threshold = 128; // Adjust this value based on your segmentation needs
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i]; // All RGB channels are the same after grayscale conversion
      const value = gray < threshold ? 0 : 255;
      data[i] = value; // Red
      data[i + 1] = value; // Green
      data[i + 2] = value; // Blue
    }

    // Example: Apply contours (basic approach using thresholding as contours)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const index = (y * width + x) * 4;
        // Basic edge detection to create contour effect
        if (
          data[index] === 255 &&
          (data[index - 4] === 0 ||
            data[index + 4] === 0 ||
            data[index - width * 4] === 0 ||
            data[index + width * 4] === 0)
        ) {
          data[index] = 255;
          data[index + 1] = 0;
          data[index + 2] = 0;
        }
      }
    }
  };

  const adjustTone = (value) => {
    return Math.min(
      Math.max(((value - minTone) / (maxTone - minTone)) * 255, 0),
      255
    );
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
        <ColorAdjustments
          brightness={brightness}
          setBrightness={setBrightness}
          hue={hue}
          setHue={setHue}
          saturation={saturation}
          setSaturation={setSaturation}
          lightness={lightness}
          setLightness={setLightness}
          gamma={gamma}
          setGamma={setGamma}
          setColorMode={setColorMode}
          red={red}
          setRed={setRed}
          green={green}
          setGreen={setGreen}
          blue={blue}
          setBlue={setBlue}
          resetBrightness={resetBrightness}
          resetHue={resetHue}
          resetSaturation={resetSaturation}
          resetLightness={resetLightness}
          resetGamma={resetGamma}
          resetRed={resetRed}
          resetGreen={resetGreen}
          resetBlue={resetBlue}
          resetTone={resetTone}
          minTone={minTone}
          maxTone={maxTone}
          setMinTone={setMinTone}
          setMaxTone={setMaxTone}
          setAutoColorBalance={setAutoColorBalance}
        />

        <div className="live-view-container">
          <h2>Live View:</h2>
          {liveViewImage ? (
            <img
              src={liveViewImage}
              alt="Live View"
              style={{ transform: `rotate(${rotation}deg)` }}
              className="live-view-image"
            />
          ) : (
            <div className="placeholder">No Image Selected</div>
          )}
        </div>

        <div className="right-controls">
          <ImageActions
            liveViewImage={liveViewImage}
            setLiveViewImage={setLiveViewImage}
            rotation={rotation}
            setRotation={setRotation}
            crop={crop}
            setCrop={setCrop}
            flip={flip}
            setFlip={setFlip}
            cropWidth={cropWidth}
            setCropWidth={setCropWidth}
            cropHeight={cropHeight}
            setCropHeight={setCropHeight}
          />
          <Segmentation
            setSegmentation={setSegmentation}
            segmentation={segmentation}
            edgeDetection={edgeDetection}
            setEdgeDetection={setEdgeDetection}
            setEmboss={setEmboss}
            emboss={emboss}
          />
        </div>
      </div>

      <ImageUploaderHandler
        image={image}
        brightness={brightness}
        hue={hue}
        saturation={saturation}
        lightness={lightness}
        tonalRange={tonalRange}
        flip={flip}
        gamma={gamma}
        colorMode={colorMode}
        red={red}
        green={green}
        blue={blue}
        minTone={minTone}
        maxTone={maxTone}
        crop={crop}
        cropWidth={cropWidth}
        cropHeight={cropHeight}
        rotation={rotation}
        cropperRef={cropperRef}
        setMessage={setMessage}
        setProcessedImage={setProcessedImage}
        AutocolorBalance={AutocolorBalance}
        Segmentation={segmentation}
        emboss={emboss}
        edgeDetection={edgeDetection}
      />

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

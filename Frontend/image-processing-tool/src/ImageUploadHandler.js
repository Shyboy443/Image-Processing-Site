import React from "react";

function ImageUploaderHandler({
  image,
  brightness,
  hue,
  saturation,
  lightness,
  flip,
  tonalRange,
  gamma,
  red,
  green,
  colorMode,
  blue,
  minTone,
  maxTone,
  crop,
  cropWidth,
  cropHeight,
  rotation,
  cropperRef,
  setMessage,
  setProcessedImage,
  AutocolorBalance,
  Segmentation,
  emboss,
  edgeDetection,
}) {
  const handleUpload = async () => {
    let finalImage = image;

    // If there's a crop operation, handle it
    if (cropperRef.current && cropperRef.current.cropper) {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
      finalImage = await new Promise((resolve) =>
        croppedCanvas.toBlob(resolve)
      );
    }

    const formData = new FormData();
    formData.append("image", finalImage);
    formData.append("brightness", brightness !== 1 ? brightness : brightness);
    formData.append("min_tone", minTone);
    formData.append("max_tone", maxTone);
    formData.append("color_mode", colorMode);
    formData.append("flip", flip);
    formData.append("hue", hue !== 0 ? hue : hue);
    formData.append("saturation", saturation !== 1 ? saturation : saturation);
    formData.append("lightness", lightness !== 1 ? lightness : lightness);
    formData.append("tonal_range", parseFloat(tonalRange));
    formData.append("gamma", parseFloat(gamma));
    formData.append("red", parseFloat(red));
    formData.append("green", parseFloat(green));
    formData.append("blue", parseFloat(blue));
    formData.append("crop", crop);
    formData.append("crop_width", parseInt(cropWidth));
    formData.append("crop_height", parseInt(cropHeight));
    formData.append("rotation", rotation);
    formData.append("colorBalance", AutocolorBalance);
    formData.append("segmentation", Segmentation);
    formData.append("edgeDetection", edgeDetection);
    formData.append("emboss", emboss);

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
    <button className="buttonUpload" onClick={handleUpload}>
      Process Image
    </button>
  );
}

export default ImageUploaderHandler;

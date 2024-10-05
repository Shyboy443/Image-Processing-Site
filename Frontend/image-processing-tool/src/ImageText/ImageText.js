import React, { useState } from "react";
import "./ImageText.css";

const ImageText = () => {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://localhost:5000/extract-text", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setExtractedText(data.text);
    } catch (error) {
      console.error("Error extracting text:", error);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    alert("Text copied to clipboard!");
  };

  return (
    <div className="image-text-container">
      <h2 className="image-text-title">Upload an Image to Extract Text</h2>
      <form onSubmit={handleSubmit} className="image-text-form">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="image-text-file-input"
        />
        <button type="submit" className="image-text-submit-button">
          Extract Text
        </button>
      </form>

      {extractedText && (
        <div className="image-text-result-container">
          <h3 className="image-text-result-title">Extracted Text:</h3>
          <div className="image-text-result-box">
            <pre>{extractedText}</pre>
          </div>
          <button
            className="image-text-copy-button"
            onClick={handleCopyToClipboard}
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageText;

import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const ColorAdjustments = ({
  brightness,
  setBrightness,
  hue,
  setHue,
  saturation,
  setSaturation,
  lightness,
  setLightness,
  gamma,
  setGamma,
  red,
  setRed,
  green,
  setGreen,
  blue,
  setBlue,
  resetBrightness,
  resetHue,
  resetSaturation,
  resetLightness,
  resetGamma,
  resetRed,
  resetGreen,
  resetBlue,
  resetTone,
  minTone,
  maxTone,
  setMinTone,
  setMaxTone,
  colorMode,
  setColorMode,
  autoColorBalance,
  setAutoColorBalance,
}) => {
  const [showRgbModal, setShowRgbModal] = useState(false);

  const handleColorModeChange = (e) => {
    const selectedColorMode = e.target.value;
    setColorMode(selectedColorMode);
  };
  const handleAutoColorBalanceChange = (e) => {
    const isChecked = e.target.checked;
    setAutoColorBalance(isChecked);
  };

  return (
    <div className="left-controls">
      <h3 style={{ color: "white" }}>Color Balance</h3>

      {/* Color Mode Dropdown */}
      <div>
        <label htmlFor="colorMode">Color Mode:</label>
        <select
          id="colorMode"
          value={colorMode}
          onChange={handleColorModeChange}
        >
          <option value="color">Color</option>
          <option value="grayscale">Grayscale</option>
          {/* Add more options if needed */}
        </select>
      </div>

      <div>
        <label htmlFor="autoColorBalance">Auto Color Balance:</label>
        <input
          type="checkbox"
          id="autoColorBalance"
          checked={autoColorBalance}
          onChange={handleAutoColorBalanceChange}
        />
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
      <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
        <label>Min Tone - Max Tone</label>

        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
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
            style={{ width: "220px" }}
          />
          <button className="resetbtn" onClick={resetTone}></button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Min Tone: {minTone}</span>
          <span>Max Tone: {maxTone}</span>
        </div>
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
                className="red-slider"
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
                className="green-slider"
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
                className="blue-slider"
              />
              <button className="resetbtn" onClick={resetBlue}></button>
            </div>
            <button onClick={() => setShowRgbModal(false)}>Close</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ColorAdjustments;

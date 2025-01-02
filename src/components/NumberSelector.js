// NumberSelector.js
import React, { useState, useEffect } from "react";

const NumberSelector = ({ maxNumber, onSelect, drawerType }) => {
  const [number, setNumber] = useState("1");

  useEffect(() => {
    setNumber("1");
  }, [drawerType]);

  const handleChange = (event) => {
    setNumber(event.target.value);
  };

  const handleSubmit = () => {
    onSelect(number);
  };

  return (
    <div>
      <input
        type="number"
        value={number}
        min="1"
        max={maxNumber}
        onChange={(e) => {
          handleChange(e);
          handleSubmit();
        }}
        onFocus={(e) => e.target.select()} // フォーカス時に全選択
      />
      <input
        type="range"
        value={number}
        min="1"
        max={maxNumber}
        onChange={(e) => {
          handleChange(e);
          handleSubmit();
        }}
        style={{ width: "100%" }} // スライダーの幅を調整
      />
      {/* <button onClick={handleSubmit}>Choose</button> */}
    </div>
  );
};

export default NumberSelector;

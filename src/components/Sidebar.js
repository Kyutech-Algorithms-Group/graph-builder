import React from "react";
import "./Sidebar.css";

const Sidebar = ({ onTypeClick }) => {
  const types = [
    "隣接集合が同じ頂点を縦に並べる手法",
    // "Simple Style",
    // "Grid Style",
    "隣接集合が同じ頂点を一つの頂点として扱う手法",
    "頂点順序に応じたアニメーションをつける手法",
    "力学モデルによるレイアウトの改善",
    // "二部置換グラフ",
  ];
  const bipartiteTypes = ["二部置換グラフ"];
  return (
    <div className="sidebar">
      <div className="sidebar-list">
        <div className="sidebar-title">真区間グラフ</div>
        {types.map((type) => (
          <p
            key={type}
            className="sidebar-item"
            onClick={() => onTypeClick(type)}
          >
            {type}
          </p>
        ))}
        <div className="sidebar-section"></div>
        <div className="sidebar-title">二部置換グラフ</div>
        {bipartiteTypes.map((type) => (
          <p
            key={type}
            className="sidebar-item"
            onClick={() => onTypeClick(type)}
          >
            {type}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

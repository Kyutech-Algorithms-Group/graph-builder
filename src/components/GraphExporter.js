// components/GraphExporter.js
import React, { useRef, useState } from "react";
import Button from "@mui/material/Button";
import CytoscapeComponent from "./SimpleDrawing.js";
import "./GraphExporter.css";
import GraphDrawer3 from "./GraphDrawer3.js";
import FcoseDrawer from "./FcoseDrawer.js";
import FcoseCliqueDrawer from "./FcoseCliqueDrawer.js";
import ForceDrawer from "./ForceDrawer.js";
import GridDrawer from "./GridDrawer.js";
import GridClique from "./GridClique.js";
import Straight from "./Straight.js";
import BipartitePermutation from "./BipartitePermutation.js";

const GraphExporter = ({ binaryValue, drawerType }) => {
  const cyRef = useRef(null);

  const handleExport = () => {
    if (cyRef.current) {
      const pngData = cyRef.current.png(); // PNG形式で画像をエクスポート
      const link = document.createElement("a");
      link.href = pngData;
      link.download = "graph.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderDrawerComponent = () => {
    switch (drawerType) {
      case "隣接集合が同じ頂点を縦に並べる手法":
        return <Straight binaryValue={binaryValue} ref={cyRef} />;
      // case "Simple Style":
      //   return <CytoscapeComponent binaryValue={binaryValue} ref={cyRef} />;
      // case "Grid Style":
      //   return <GridDrawer binaryValue={binaryValue} ref={cyRef} />;
      case "隣接集合が同じ頂点を一つの頂点として扱う手法":
        return <GridClique binaryValue={binaryValue} ref={cyRef} />;
      case "頂点順序に応じたアニメーションをつける手法":
        return <GraphDrawer3 binaryValue={binaryValue} ref={cyRef} />;
      // case "Force Style":
      //     return <FcoseDrawer binaryValue={binaryValue} ref={cyRef} />;
      // case "Force Clique Style":
      //     return <FcoseCliqueDrawer binaryValue={binaryValue} ref={cyRef} />;
      case "力学モデルによるレイアウトの改善":
        return <ForceDrawer binaryValue={binaryValue} ref={cyRef} />;
      case "二部置換グラフ":
        return <BipartitePermutation binaryValue={binaryValue} ref={cyRef} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {renderDrawerComponent()}
      {/* <Button
        className="graph-export-button"
        variant="outlined"
        onClick={handleExport}
        style={{ backgroundColor: "#a0522d", color: "white" }}
      >
        Export Graph as PNG
      </Button> */}
    </div>
  );
};

export default GraphExporter;

import React from "react";
import "./App.css";
import Header from "./components/Header.js";
import Sidebar from "./components/Sidebar.js";
import GraphExporter from "./components/GraphExporter.js";
import FileReaderComponent from "./components/FileReaderComponent.js";
import NumberSelector from "./components/NumberSelector.js";
import calculateEdgeIntersections from "./utils/CalculateEdgeIntersections";
import calculateEdgeIntersectionsClique from "./utils/CalculateEdgeIntersectionsClique.js";
import ForceDrawer from "./components/ForceDrawer.js";

function App() {
  const [binaryValue, setBinaryValue] = React.useState("");
  const [nodes, setNodes] = React.useState([]);
  const [levels, setLevels] = React.useState([]);
  const [edges0, setEdges0] = React.useState([]);
  const [edges1, setEdges1] = React.useState([]);
  const [dp, setDp] = React.useState([]);
  const [displayDp, setDisplayDp] = React.useState("");
  const [binaryByZdd, setBinaryByZdd] = React.useState("");
  const [graphType, setGraphType] =
    React.useState("隣接集合が同じ頂点を縦に並べる手法");
  const forceDrawerRef = React.useRef(null);

  const handleBinaryInputChange = (newValue) => {
    setBinaryValue(newValue);
  };

  const handleFileData = (
    parsedNodes,
    parsedLevels,
    parsedEdges0,
    parsedEdges1,
    calculatedDp,
    displayDp
  ) => {
    console.log("parsedNodes", parsedNodes);
    console.log("parsedLevels", parsedLevels);
    console.log("parsedEdges0", parsedEdges0);
    console.log("parsedEdges1", parsedEdges1);
    setNodes(parsedNodes);
    setLevels(parsedLevels);
    setEdges0(parsedEdges0);
    setEdges1(parsedEdges1);
    setDp(calculatedDp);
    setDisplayDp(displayDp);
  };

  const handleGraphTypeChange = (newGraphType) => {
    setGraphType(newGraphType);
    setBinaryByZdd("");
    setDisplayDp("");
    setNodes([]);
    setLevels([]);
    setEdges0([]);
    setEdges1([]);
    setDp([]);
  };

  function chooseBinaryToGraph(number) {
    console.log("number", number);
    let cpnumber = parseInt(number);
    let s = "";
    for (let i = nodes[nodes.length - 1]; i > 0; ) {
      if (cpnumber <= dp[edges1[i - 1]]) {
        s += "0";
        for (
          let j = 0;
          j <
          (edges1[i - 1] - 1 >= 0
            ? Math.abs(levels[i - 1] - levels[edges1[i - 1] - 1]) - 1
            : Math.abs(levels[i - 1] - 1));
          j++
        ) {
          s += "1";
        }
        i = edges1[i - 1];
      } else {
        s += "1";
        cpnumber -= dp[edges1[i - 1]];
        for (
          let j = 0;
          j <
          (edges0[i - 1] - 1 >= 0
            ? Math.abs(levels[i - 1] - levels[edges0[i - 1] - 1]) - 1
            : Math.abs(levels[i - 1] - 1));
          j++
        ) {
          s += "1";
        }
        i = edges0[i - 1];
      }
    }
    let res = "";
    for (let i = 0; i < s.length; i += 2) {
      res += s[i];
    }
    for (let i = s.length - 1; i >= 0; i -= 2) {
      res += s[i];
    }
    setBinaryByZdd(res);
    return res;
  }

  // const exportAllBinaryStrings = () => {
  //   const results = [];
  //   let sum = 0;
  //   for (let i = 1; i <= displayDp; i++) {
  //     const binaryString = chooseBinaryToGraph(i);
  //     const intersections = calculateEdgeIntersectionsClique(binaryString);
  //     // results.push(
  //     //   `Number: ${i}, Binary String: ${binaryString}, Intersections: ${intersections}`
  //     // );
  //     sum += intersections;
  //   }
  //   results.push(`Avarege Intersections: ${sum / displayDp}`);
  //   const blob = new Blob([results.join("\n")], { type: "text/plain" });
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   link.download = "clique_intersections13.txt";
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const exportAllBinaryStrings = async () => {
    const results = [];
    let sum = 0;
    for (let i = 1; i <= displayDp; i++) {
      const binaryString = chooseBinaryToGraph(i);
      setBinaryValue(binaryString);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 100ms待つ
      const intersections = forceDrawerRef.current.getIntersectionCount();
      sum += intersections;
    }
    results.push(`Average Intersections: ${sum / displayDp}`);
    const blob = new Blob([results.join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "force_intersections12.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app">
      <Sidebar onTypeClick={handleGraphTypeChange} />

      <div className="content">
        <FileReaderComponent
          onFileDataProcessed={handleFileData}
          selectedMenu={graphType}
        />
        <pre>解の個数: {displayDp}</pre>
        <pre>二値文字列: {binaryByZdd}</pre>
        <NumberSelector
          maxNumber={displayDp}
          onSelect={chooseBinaryToGraph}
          drawerType={graphType}
        />
        <GraphExporter binaryValue={binaryByZdd} drawerType={graphType} />
        {/* <button onClick={exportAllBinaryStrings}>
          Export All Binary Strings
        </button>
        <ForceDrawer ref={forceDrawerRef} binaryValue={binaryByZdd} /> */}
      </div>
    </div>
  );
}

export default App;

// App.js
import React from 'react';
import './App.css';
import Header from './components/Header.js';
import Sidebar from './components/Sidebar.js';
import GraphExporter from './components/GraphExporter.js';
import FileReaderComponent from './components/FileReaderComponent.js';
import NumberSelector from './components/NumberSelector.js';


function App() {
  const [binaryValue, setBinaryValue] = React.useState('');
  const [nodes, setNodes] = React.useState([]);
  const [levels, setLevels] = React.useState([]);
  const [edges0, setEdges0] = React.useState([]);
  const [edges1, setEdges1] = React.useState([]);
  const [dp, setDp] = React.useState([]);
  const [displayDp, setDisplayDp] = React.useState('');
  const [binaryByZdd, setBinaryByZdd] = React.useState('');
  const [graphType, setGraphType] = React.useState('Simple Style');

  const handleBinaryInputChange = (newValue) => {
    setBinaryValue(newValue);
  };

  const handleFileData = (parsedNodes, parsedLevels, parsedEdges0, parsedEdges1, calculatedDp, displayDp) => {
    setNodes(parsedNodes);
    setLevels(parsedLevels);
    setEdges0(parsedEdges0);
    setEdges1(parsedEdges1);
    setDp(calculatedDp);
    setDisplayDp(displayDp);
  }

  const handleGraphTypeChange = (newGraphType) => {
    setGraphType(newGraphType);
  }

  function chooseBinaryToGraph(number) {
    let cpnumber = BigInt(number);
    let s = '';
    for (let i = nodes[nodes.length - 1]; i > 0;) {
      if (cpnumber <= dp[edges1[i - 1]]) {
        // 自分の実装とgraphillion形式の01が逆なので逆にしている
        s += '0';
        for (let j = 0; j < ((edges1[i - 1] - 1 >= 0) ? Math.abs(levels[i - 1] - levels[edges1[i - 1] - 1]) - 1 : Math.abs(levels[i - 1] - 1)); j++) {
          s += '1';
        }
        i = edges1[i - 1];
      } else {
        s += '1';
        cpnumber -= dp[edges1[i - 1]];
        for (let j = 0; j < ((edges0[i - 1] - 1 >= 0) ? Math.abs(levels[i - 1] - levels[edges0[i - 1] - 1]) - 1 : Math.abs(levels[i - 1] - 1)); j++) {
          s += '1';
        }
        i = edges0[i - 1];
      }
    }
    let res = '';
    for (let i = 0; i < s.length; i += 2) {
      res += s[i];
    }
    for (let i = s.length - 1; i >= 0; i -= 2) {
      res += s[i];
    }
    setBinaryByZdd(res);
  }

  return (
    <div className='app'>
      <Sidebar onTypeClick={handleGraphTypeChange} />

      <div className='content'>
        {/* <Header onChange={handleBinaryInputChange} /> */}
        <FileReaderComponent onFileDataProcessed={handleFileData} />
        <pre>解の個数: {displayDp}</pre>
        <pre>二値文字列: {binaryByZdd}</pre>
        <NumberSelector maxNumber={displayDp} onSelect={chooseBinaryToGraph} />
        <GraphExporter binaryValue={binaryByZdd} drawerType={graphType} />
      </div>
    </div>
  );
}

export default App;

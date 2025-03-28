import React, { useEffect, useState } from "react";

function FileReaderComponent({ onFileDataProcessed, selectedMenu }) {
  const [fileContent, setFileContent] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  // const files = ['graphillion003.txt', 'graphillion004.txt', 'graphillion005.txt']; // プロジェクト内のファイル名をここに追加
  // graphillion003.txtからgraphillion030.txtまでのファイル名をfilesに追加

  // サイドバーの選択に応じてファイルリストを更新
  const getFiles = (sidebar) => {
    if (sidebar === "二部置換グラフ") {
      return Array.from(
        { length: 30 },
        (_, i) => `bipartite${String(i + 1).padStart(3, "0")}.txt`
      );
    } else {
      return Array.from(
        { length: 30 },
        (_, i) => `graphillion${String(i + 1).padStart(3, "0")}.txt`
      );
    }
  };

  const [files, setFiles] = useState(getFiles(selectedMenu));

  useEffect(() => {
    setFiles(getFiles(selectedMenu));
    setSelectedFile("");
    setFileContent("");
  }, [selectedMenu]);

  // ファイルの内容を処理する関数
  const processFileContent = (content) => {
    let parsedNodes = [];
    let parsedLevels = [];
    let parsedEdges0 = [];
    let parsedEdges1 = [];
    // 行ごとに分割
    const lines = content.split("\n");
    for (let line of lines) {
      if (line.trim() === "") continue;
      const [a, b, c, d] = line.split(" ");
      parsedNodes.push(parseInt(a));
      parsedLevels.push(parseInt(b));

      if (c === "B") parsedEdges0.push(-1);
      else if (c === "T") parsedEdges0.push(0);
      else parsedEdges0.push(parseInt(c));

      if (d === "B") parsedEdges1.push(-1);
      else if (d === "T") parsedEdges1.push(0);
      else parsedEdges1.push(parseInt(d));
    }
    const n = parsedNodes.length;
    let adjustedEdges0 = [...parsedEdges0]; // コピーを作成
    let adjustedEdges1 = [...parsedEdges1]; // コピーを作成
    for (let i = 0; i < n; i++) {
      if (parsedEdges0[i] === -1) adjustedEdges0[i] = n + 1;
      if (parsedEdges1[i] === -1) adjustedEdges1[i] = n + 1;
    }
    // let calculatedDp = new Array(n + 1).fill(BigInt(0));
    let calculatedDp = new Array(n + 1).fill(0);
    // calculatedDp[0] = BigInt(1);
    calculatedDp[0] = 1;
    for (let i = 0; i < n; i++) {
      if (adjustedEdges0[i] !== n + 1) {
        calculatedDp[parsedNodes[i]] += calculatedDp[adjustedEdges0[i]];
      }
      if (adjustedEdges1[i] !== n + 1) {
        calculatedDp[parsedNodes[i]] += calculatedDp[adjustedEdges1[i]];
      }
    }
    // 親コンポーネントにデータを渡す
    onFileDataProcessed(
      parsedNodes,
      parsedLevels,
      parsedEdges0,
      parsedEdges1,
      calculatedDp,
      calculatedDp[n].toString()
    );
  };

  // 選択されたファイルを読み込む関数
  const handleFileSelect = async (event) => {
    const selectedFileName = event.target.value;
    setSelectedFile(selectedFileName);
    try {
      const response = await fetch(
        `${process.env.PUBLIC_URL}/graphillion/${selectedFileName}`
      );
      const content = await response.text();
      processFileContent(content);
      setFileContent(content);
    } catch (error) {
      console.error("ファイルの読み込みに失敗しました:", error);
    }
  };

  const extractNumber = (fileName) => {
    const match = fileName.match(/\d+/);
    return match ? match[0] : fileName;
  };

  return (
    <div>
      <select value={selectedFile} onChange={handleFileSelect}>
        <option value="">頂点数を選択してください</option>
        {files.map((file, index) => (
          <option key={index} value={file}>
            {extractNumber(file)}
            {/* {file} */}
          </option>
        ))}
      </select>
      {/* 以下がデバッグ用の表示 */}
      {/* <pre>{fileContent}</pre> */}
    </div>
  );
}

export default FileReaderComponent;

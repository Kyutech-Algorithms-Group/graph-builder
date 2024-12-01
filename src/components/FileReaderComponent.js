import React, { useState } from 'react';

function FileReaderComponent({ onFileDataProcessed }) {
    const [fileContent, setFileContent] = useState('');
    const [selectedFile, setSelectedFile] = useState('');
    // const files = ['graphillion003.txt', 'graphillion004.txt', 'graphillion005.txt']; // プロジェクト内のファイル名をここに追加
    // graphillion003.txtからgraphillion030.txtまでのファイル名をfilesに追加
    const files = Array.from({ length: 30 }, (_, i) => `graphillion${String(i + 1).padStart(3, '0')}.txt`);

    // ファイルの内容を処理する関数
    const processFileContent = (content) => {
        let parsedNodes = [];
        let parsedLevels = [];
        let parsedEdges0 = [];
        let parsedEdges1 = [];
        // 行ごとに分割
        const lines = content.split('\n');
        for (let line of lines) {
            if (line.trim() === '') continue;
            const [a, b, c, d] = line.split(' ');
            parsedNodes.push(parseInt(a));
            parsedLevels.push(parseInt(b));

            if (c === 'B') parsedEdges0.push(-1);
            else if (c === 'T') parsedEdges0.push(0);
            else parsedEdges0.push(parseInt(c));

            if (d === 'B') parsedEdges1.push(-1);
            else if (d === 'T') parsedEdges1.push(0);
            else parsedEdges1.push(parseInt(d));
        }
        const n = parsedNodes.length;
        let adjustedEdges0 = [...parsedEdges0]; // コピーを作成
        let adjustedEdges1 = [...parsedEdges1]; // コピーを作成
        for (let i = 0; i < n; i++) {
            if (parsedEdges0[i] === -1) adjustedEdges0[i] = n + 1;
            if (parsedEdges1[i] === -1) adjustedEdges1[i] = n + 1;
        }
        let calculatedDp = new Array(n + 1).fill(BigInt(0));
        calculatedDp[0] = BigInt(1);
        for (let i = 0; i < n; i++) {
            if (adjustedEdges0[i] !== n + 1) {
                calculatedDp[parsedNodes[i]] += calculatedDp[adjustedEdges0[i]];
            }
            if (adjustedEdges1[i] !== n + 1) {
                calculatedDp[parsedNodes[i]] += calculatedDp[adjustedEdges1[i]];
            }
        }
        // 親コンポーネントにデータを渡す
        onFileDataProcessed(parsedNodes, parsedLevels, parsedEdges0, parsedEdges1, calculatedDp, calculatedDp[n].toString());
    };

    // 選択されたファイルを読み込む関数
    const handleFileSelect = async (event) => {
        const selectedFileName = event.target.value;
        setSelectedFile(selectedFileName);
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/graphillion/${selectedFileName}`);
            const content = await response.text();
            processFileContent(content);
            setFileContent(content);
        } catch (error) {
            console.error('ファイルの読み込みに失敗しました:', error);
        }
    };

    return (
        <div>
            <select value={selectedFile} onChange={handleFileSelect}>
                <option value="">ファイルを選択してください</option>
                {files.map((file, index) => (
                    <option key={index} value={file}>{file}</option>
                ))}
            </select>
            {/* 以下がデバッグ用の表示 */}
            {/* <pre>{fileContent}</pre> */}
        </div>
    );
}

export default FileReaderComponent;

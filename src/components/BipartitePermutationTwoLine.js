import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import ForceGraph2D from "react-force-graph-2d";

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const BipartitePermutationTwoLine = forwardRef(({ binaryValue }, ref) => {
  const graphRef = useRef(null);
  const [data, setData] = useState({ nodes: [], links: [] });

  useImperativeHandle(ref, () => ({
    png: () => (graphRef.current ? graphRef.current.toPng() : null),
  }));

  useEffect(() => {
    const nodes = [];
    const edges = [];
    const queue = [];
    let idx = 0;

    let n = binaryValue.length / 2;
    let g = [];
    for (let i = 0; i < n; i++) {
      g.push([]);
    }
    for (let i = 0; i < n; i++) {
      g[i].push(i);
    }
    // for (let i = 0; i < binaryValue.length; i++) {
    //   if (binaryValue[i] === "0") {
    //     queue.push(idx);
    //     idx++;
    //   } else {
    //     let node = queue.shift();
    //     for (let j = 0; j < queue.length; j++) {
    //       g[node].push(queue[j]);
    //       g[queue[j]].push(node);
    //     }
    //   }
    // }
    for (let i = 0; i < n; i++) {
      g[i].sort((a, b) => a - b);
    }

    const nodeGroupMapping = {};
    nodeGroupMapping[0] = 0;

    // 二値文字列を2つに分割
    let bv1 = "",
      bv2 = "";
    for (let i = 0; i < binaryValue.length; i++) {
      if (i % 2 === 0) {
        bv1 += binaryValue[i];
      } else {
        bv2 += binaryValue[i];
      }
    }

    console.log("bv1", bv1);
    console.log("bv2", bv2);

    let w1 = 1,
      w2 = 1,
      w = 1;
    let nodePositions = {};
    for (let i = 0; i < n; i++) {
      let position;
      // ここでどこに頂点を配置するかを決める
      let node_color;
      let y_position;
      if (bv1[i] === "1") {
        node_color = "#191970";
        y_position = 100;
        w = w1;
        w1++;
      } else {
        node_color = "#dc143c";
        y_position = 200;
        w = w2;
        w2++;
      }
      position = { x: 100 * w, y: y_position };
      nodes.push({
        id: `node${i}`,
        label: `${i}`,
        x: position.x,
        y: position.y,
        color: node_color,
      });
      nodePositions[`node${i}`] = position;
      nodeGroupMapping[i] = i;
    }
    // if (clique_siz > 1) {
    //   nodes.push({
    //     id: `node${node_id}`,
    //     label: `${clique_siz}`,
    //     x: 100 * w,
    //     y: 100,
    //     color: "#ff6347",
    //   });
    //   nodePositions[`node${node_id}`] = { x: 100 * w, y: 100 };
    // } else {
    //   let node_color;
    //   let y_position;
    //   if (bv1[node_id] === "1") {
    //     node_color = "#191970";
    //     y_position = 100;
    //   } else {
    //     node_color = "#dc143c";
    //     y_position = 200;
    //   }
    //   nodes.push({
    //     id: `node${node_id}`,
    //     label: `${node_id}`,
    //     x: 100 * w,
    //     y: 100,
    //     color: node_color,
    //   });
    //   nodePositions[`node${node_id}`] = { x: 100 * w, y: 100 };
    // }

    // 辺の処理
    let que = [];
    for (
      let idx1 = 0, idx2 = 0, qidx = 0;
      idx1 < n && idx2 < n;
      ++idx1, ++idx2
    ) {
      while (idx1 < n && bv1[idx1] === "0") {
        que.push(idx1);
        idx1++;
      }
      while (idx2 < n && bv2[idx2] === "0") {
        qidx++;
        idx2++;
      }
      for (let i = qidx; i < que.length; i++) {
        edges.push({
          source: `node${idx1}`,
          target: `node${que[i]}`,
          id: `edge${idx1}-${que[i]}`,
          value: 1,
        });
      }
    }
    // let idx1 = 0;
    // let idx2 = 0;

    // while (idx1 < n && idx2 < n) {
    //   if (bv1[idx1] === "0") {
    //     idx1++;
    //   }
    //   while (idx2 < n && bv2[idx2] === "1") {
    //     idx2++;
    //     queue1.push()
    //   }
    // }

    // for (let i = 0; i < n; i++) {
    //   if (bv1[i] === "1") {
    //     queue1.push(i);
    //   }
    // }
    // for (let i = 0; i < n; i++) {
    //   for (let j = i + 1; j < n; j++) {
    //     if (bv1[i] === "1") {
    //       index++;
    //       continue;
    //     }
    //     if (bv1[i] === "0" && bv2[j] === "0") {
    //       // queue1の中にある頂点と結ぶ
    //       let cnt = 0;
    //       for (let k = 0; k < queue1.length && k < index; k++) {
    //         edges.push({
    //           source: `node${i}`,
    //           target: `node${queue1[k]}`,
    //           id: `edge${i}-${queue1[k]}`,
    //           value: 1,
    //         });
    //         queue1.shift();
    //         cnt++;
    //       }
    //       index -= cnt;
    //     } else {
    //       queue1.push(j);
    //     }
    //   }
    // }
    // idx = 0;
    // let edge_id = 0;
    // let edgeSet = new Set();
    // for (let i = 0; i < binaryValue.length; i++) {
    //   if (binaryValue[i] === "0") {
    //     queue.push(idx);
    //     idx++;
    //   } else {
    //     let node = queue.shift();
    //     for (let j = 0; j < queue.length; j++) {
    //       let sourceGroup = nodeGroupMapping[node];
    //       let targetGroup = nodeGroupMapping[queue[j]];
    //       if (sourceGroup !== targetGroup) {
    //         let edgeKey = `node${sourceGroup}-node${targetGroup}`;
    //         let reverseEdgeKey = `node${targetGroup}-node${sourceGroup}`;
    //         if (!edgeSet.has(edgeKey) && !edgeSet.has(reverseEdgeKey)) {
    //           edgeSet.add(edgeKey);
    //           edges.push({
    //             source: `node${sourceGroup}`,
    //             target: `node${targetGroup}`,
    //             id: `edge${edge_id++}`,
    //             value: 1,
    //           });
    //         }
    //       }
    //     }
    //   }
    // }

    setData({ nodes, links: edges });
  }, [binaryValue]);

  const handleNodeDragEnd = (node) => {
    // 全てのノードの座標を取得
    const currentNodes = data.nodes;
    currentNodes.forEach((n) => {
      console.log(`Node ID: ${n.id}, X: ${n.x}, Y: ${n.y}`);
    });
  };

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={data}
      nodeLabel="label"
      nodeAutoColorBy="color"
      linkColor={() => "#696969"}
      //   linkDirectionalParticles="value"
      //   linkDirectionalParticleWidth={6} // パーティクルの幅を指定
      //   linkDirectionalParticleSpeed={0.005}
      nodeRelSize={10}
      onNodeClick={(node) => alert(`Clicked node ${node.id}`)}
      onNodeDragEnd={handleNodeDragEnd} // ノードドラッグ完了時にハンドラーを追加
      // どっちも1にしたら力学モデルが止まった
      d3AlphaDecay={1} // ノードのレイアウト速度を遅くする
      d3VelocityDecay={1} // ノードの移動速度を減衰させる
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.label;
        const fontSize = 24 / globalScale;
        const nodeSize = 6;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (node.color === "#ff6347") {
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false); // 赤いノードを描画
          ctx.fill();
          ctx.fillStyle = "#000000";
          ctx.fillText(label, node.x, node.y); // ラベルをノードに重ねて表示
        } else {
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false); // 通常のノードを描画
          ctx.fill();
        }
      }}
    />
  );
});

export default BipartitePermutationTwoLine;

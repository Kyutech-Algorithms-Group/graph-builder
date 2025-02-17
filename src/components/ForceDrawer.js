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

const ForceDrawer = forwardRef(({ binaryValue }, ref) => {
  const graphRef = useRef(null);
  const [data, setData] = useState({ nodes: [], links: [] });
  const [intersectionCount, setIntersectionCount] = useState(0);

  useImperativeHandle(ref, () => ({
    png: () => (graphRef.current ? graphRef.current.toPng() : null),
    getIntersectionCount: () => intersectionCount,
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
    for (let i = 0; i < binaryValue.length; i++) {
      if (binaryValue[i] === "0") {
        queue.push(idx);
        idx++;
      } else {
        let node = queue.shift();
        for (let j = 0; j < queue.length; j++) {
          g[node].push(queue[j]);
          g[queue[j]].push(node);
        }
      }
    }
    for (let i = 0; i < n; i++) {
      g[i].sort((a, b) => a - b);
    }

    const nodeGroupMapping = {};
    nodeGroupMapping[0] = 0;

    let w = 1,
      clique_siz = 1,
      node_id = 0;
    let nodePositions = {};
    for (let i = 1; i < n; i++) {
      let position;
      if (arraysEqual(g[i], g[i - 1])) {
        clique_siz++;
        nodeGroupMapping[i] = node_id;
      } else {
        // ランダムな座標を生成
        const randomX = Math.random() * 800 - 400;
        const randomY = Math.random() * 800 - 400;

        position = { x: randomX, y: randomY };
        if (clique_siz > 1) {
          nodes.push({
            id: `node${node_id}`,
            label: `${clique_siz}`,
            x: position.x,
            y: position.y,
            color: "#dc143c",
          });
          clique_siz = 1;
          nodePositions[`node${node_id}`] = position;
        } else {
          nodes.push({
            id: `node${node_id}`,
            label: `${node_id}`,
            x: position.x,
            y: position.y,
            color: "#4169e1",
          });
          nodePositions[`node${node_id}`] = position;
        }
        nodeGroupMapping[i] = node_id + 1;
        node_id++;
        w++;
      }
    }
    if (clique_siz > 1) {
      const randomX = Math.random() * 800 - 400;
      const randomY = Math.random() * 800 - 400;
      nodes.push({
        id: `node${node_id}`,
        label: `${clique_siz}`,
        x: randomX,
        y: randomY,
        color: "#dc143c",
      });
      nodePositions[`node${node_id}`] = { x: randomX, y: randomY };
    } else {
      const randomX = Math.random() * 800 - 400;
      const randomY = Math.random() * 800 - 400;
      nodes.push({
        id: `node${node_id}`,
        label: `${node_id}`,
        x: randomX,
        y: randomY,
        color: "#4169e1",
      });
      nodePositions[`node${node_id}`] = { x: randomX, y: randomY };
    }

    // 辺の処理
    idx = 0;
    let edge_id = 0;
    let edgeSet = new Set();
    for (let i = 0; i < binaryValue.length; i++) {
      if (binaryValue[i] === "0") {
        queue.push(idx);
        idx++;
      } else {
        let node = queue.shift();
        for (let j = 0; j < queue.length; j++) {
          let sourceGroup = nodeGroupMapping[node];
          let targetGroup = nodeGroupMapping[queue[j]];
          if (sourceGroup !== targetGroup) {
            let edgeKey = `node${sourceGroup}-node${targetGroup}`;
            let reverseEdgeKey = `node${targetGroup}-node${sourceGroup}`;
            if (!edgeSet.has(edgeKey) && !edgeSet.has(reverseEdgeKey)) {
              edgeSet.add(edgeKey);
              edges.push({
                source: `node${sourceGroup}`,
                target: `node${targetGroup}`,
                id: `edge${edge_id++}`,
                value: 1,
              });
            }
          }
        }
      }
    }

    setData({ nodes, links: edges });
    // 力学モデルのシミュレーションを待つ
    setTimeout(() => {
      calculateEdgeIntersections();
    }, 500); // 秒待つ
  }, [binaryValue]);

  const calculateEdgeIntersections = () => {
    const edges = data.links;
    function edgesIntersect(s1, t1, s2, t2) {
      // 交差判定のロジックを実装
      let s = (s1.x - t1.x) * (s2.y - s1.y) - (s1.y - t1.y) * (s2.x - s1.x);
      let t = (s1.x - t1.x) * (t2.y - s1.y) - (s1.y - t1.y) * (t2.x - s1.x);
      let u = (s2.x - t2.x) * (s1.y - s2.y) - (s2.y - t2.y) * (s1.x - s2.x);
      let v = (s2.x - t2.x) * (t1.y - s2.y) - (s2.y - t2.y) * (t1.x - s2.x);
      return s * t < 0 && u * v < 0;
    }

    let intersectionCount = 0;

    edges.forEach((edge1, i) => {
      const s1 = edge1.source;
      const t1 = edge1.target;
      edges.slice(i + 1).forEach((edge2) => {
        const s2 = edge2.source;
        const t2 = edge2.target;
        if (edgesIntersect(s1, t1, s2, t2)) {
          intersectionCount++;
        }
      });
    });

    setIntersectionCount(intersectionCount);
    console.log(`Edge Intersections: ${intersectionCount}`);
  };

  const handleNodeDragEnd = (node) => {
    // 全てのノードの座標を取得
    const currentNodes = data.nodes;
    currentNodes.forEach((n) => {
      console.log(`Node ID: ${n.id}, X: ${n.x}, Y: ${n.y}`);
    });
    const currentEdges = data.links;
    currentEdges.forEach((e) => {
      console.log(
        `sourcex: ${e.source.x}, sourcey: ${e.source.y}, targetx: ${e.target.x}, targety: ${e.target.y}`
      );
    });
  };

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={data}
      nodeLabel="label"
      nodeAutoColorBy="color"
      linkColor={() => "#696969"}
      linkDirectionalParticles="value"
      linkDirectionalParticleWidth={8} // パーティクルの幅を指定
      linkDirectionalParticleSpeed={0.005}
      nodeRelSize={10}
      onNodeClick={(node) => alert(`Clicked node ${node.id}`)}
      onNodeDragEnd={handleNodeDragEnd} // ノードドラッグ完了時にハンドラーを追加
      // d3AlphaDecay={0.005} // ノードのレイアウト速度を遅くする
      // d3VelocityDecay={0.2} // ノードの移動速度を減衰させる
      // d3ForceLayout={(layout) => {
      //     layout.force('charge').strength(-30); // 引力/斥力の強さを調整
      // }}
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.label;
        const fontSize = 32 / globalScale;
        const nodeSize = 8;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (node.color === "#dc143c") {
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

export default ForceDrawer;

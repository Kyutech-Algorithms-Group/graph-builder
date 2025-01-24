import calculateEdgeIntersections from "./CalculateEdgeIntersections";

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function calculateEdgeIntersectionsClique(binaryValue) {
  const nodes = [];
  let edges = [];
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
      position = { x: 100 * w, y: 100 };
      if (clique_siz > 1) {
        nodes.push({
          data: { id: `node${node_id}`, label: `${clique_siz}` },
          position: position,
          classes: "clique",
        });
        clique_siz = 1;
        nodePositions[`node${node_id}`] = position;
      } else {
        nodes.push({
          data: { id: `node${node_id}`, label: `${node_id}` },
          position: position,
        });
        nodePositions[`node${node_id}`] = position;
      }
      nodeGroupMapping[i] = node_id + 1;
      node_id++;
      w++;
    }
  }
  if (clique_siz > 1) {
    nodes.push({
      data: { id: `node${node_id}`, label: `${clique_siz}` },
      position: { x: 100 * w, y: 100 },
      classes: "clique",
    });
    nodePositions[`node${node_id}`] = { x: 100 * w, y: 100 };
  } else {
    nodes.push({
      data: { id: `node${node_id}`, label: `${node_id}` },
      position: { x: 100 * w, y: 100 },
    });
    nodePositions[`node${node_id}`] = { x: 100 * w, y: 100 };
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
        let classes = "";
        let sourceGroup = nodeGroupMapping[node];
        let targetGroup = nodeGroupMapping[queue[j]];
        let sourcePosition = nodePositions[`node${sourceGroup}`];
        let targetPosition = nodePositions[`node${targetGroup}`];
        if (
          (Math.abs(sourcePosition.x - targetPosition.x) >= 200 &&
            sourcePosition.y === targetPosition.y) ||
          (Math.abs(sourcePosition.y - targetPosition.y) >= 200 &&
            sourcePosition.x === targetPosition.x)
        ) {
          classes = "nonSequential";
        }
        if (sourceGroup !== targetGroup) {
          // 辺の一意性を保証するためのキーを生成
          let edgeKey = `node${sourceGroup}-node${targetGroup}`;
          let reverseEdgeKey = `node${targetGroup}-node${sourceGroup}`;
          if (!edgeSet.has(edgeKey) && !edgeSet.has(reverseEdgeKey)) {
            edgeSet.add(edgeKey);
            edges.push({
              data: {
                id: `edge${edge_id++}`,
                source: `node${sourceGroup}`,
                target: `node${targetGroup}`,
                value: 1,
              },
              classes: classes,
            });
          }
        }
      }
    }
  }

  function edgesIntersect(s1, t1, s2, t2) {
    // 交差判定のロジックを実装
    return (
      (s1.x < s2.x && s2.x < t1.x && t1.x < t2.x) ||
      (s1.x === s2.x &&
        t1.x < t2.x &&
        t1.x - s1.x > 100 &&
        t2.x - s2.x > 100) ||
      (t1.x === t2.x && s1.x < s2.x && t1.x - s1.x > 100 && t2.x - s2.x > 100)
    );
  }

  let intersectionCount = 0;

  edges.forEach((edge1, i) => {
    const s1 = nodes.find((n) => n.data.id === edge1.data.source).position;
    const t1 = nodes.find((n) => n.data.id === edge1.data.target).position;
    edges.slice(i + 1).forEach((edge2) => {
      const s2 = nodes.find((n) => n.data.id === edge2.data.source).position;
      const t2 = nodes.find((n) => n.data.id === edge2.data.target).position;
      if (edgesIntersect(s1, t1, s2, t2)) {
        intersectionCount++;
      }
    });
  });

  return intersectionCount;
}

export default calculateEdgeIntersectionsClique;

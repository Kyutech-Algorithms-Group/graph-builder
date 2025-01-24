function calculateEdgeIntersections(binaryValue) {
  const nodes = [];
  const edges = [];
  const queue = [];
  let edge_id = 0;
  let idx = 0;

  // バイナリ文字列を元にノードとエッジを作成
  for (let i = 0; i < binaryValue.length / 2; i++) {
    nodes.push({
      data: { id: `node${i}`, label: `{i}` },
      position: { x: 80 * i, y: 100 },
    });
  }
  for (let i = 0; i < binaryValue.length; i++) {
    if (binaryValue[i] === "0") {
      queue.push(idx);
      idx++;
    } else {
      let node = queue.shift();
      for (let j = 0; j < queue.length; j++) {
        let classes = "";
        if (Math.abs(node - queue[j]) > 1) {
          classes = "nonSequential";
        }
        edges.push({
          data: {
            id: `edge${edge_id++}`,
            source: `node${node}`,
            target: `node${queue[j]}`,
          },
          classes: classes,
        });
      }
    }
  }

  // 辺の交差数を計算する関数
  function edgesIntersect(s1, t1, s2, t2) {
    // 交差判定のロジックを実装
    return (
      (s1.x < s2.x && s2.x < t1.x && t1.x < t2.x) ||
      (s1.x === s2.x && t1.x < t2.x && t1.x - s1.x > 80 && t2.x - s2.x > 80) ||
      (t1.x === t2.x && s1.x < s2.x && t1.x - s1.x > 80 && t2.x - s2.x > 80)
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

export default calculateEdgeIntersections;

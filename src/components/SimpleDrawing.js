// components/CytoscapeComponent.js
import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import cytoscape from "cytoscape";

const CytoscapeComponent = forwardRef(({ binaryValue }, ref) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useImperativeHandle(ref, () => ({
    png: () => (cyRef.current ? cyRef.current.png() : null),
  }));

  useEffect(() => {
    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#666",
            // label: "data(id)",
            width: "20px",
            height: "20px",
          },
        },
        {
          selector: "edge",
          style: {
            width: 1,
            "line-color": "#999999",
          },
        },
        {
          selector: "edge.nonSequential",
          style: {
            "curve-style": "unbundled-bezier",
            // "control-point-distance": 100, // 制御点の距離を設定
            // "control-point-weight": 0.5, // 制御点の重みを設定
            "control-point-step-size": 100, // 制御点のステップサイズを設定
          },
        },
      ],
      layout: {
        name: "grid",
        rows: 1,
      },
    });

    cyRef.current = cy; // Cytoscapeインスタンスを保存

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

    cy.add(nodes);
    cy.add(edges);

    cy.layout({
      //   name: "grid",
      name: "preset",
      rows: 1,
    }).run();

    function edgesIntersect(s1, t1, s2, t2) {
      // 交差判定のロジックを実装
      return (
        (s1.x < s2.x && s2.x < t1.x && t1.x < t2.x) ||
        (s1.x === s2.x &&
          t1.x < t2.x &&
          t1.x - s1.x > 80 &&
          t2.x - s2.x > 80) ||
        (t1.x === t2.x && s1.x < s2.x && t1.x - s1.x > 80 && t2.x - s2.x > 80)
      );
      //   let s = (s1.x - t1.x) * (s2.y - s1.y) - (s1.y - t1.y) * (s2.x - s1.x);
      //   let t = (s1.x - t1.x) * (t2.y - s1.y) - (s1.y - t1.y) * (t2.x - s1.x);
      //   let u = (s2.x - t2.x) * (s1.y - s2.y) - (s2.y - t2.y) * (s1.x - s2.x);
      //   let v = (s2.x - t2.x) * (t1.y - s2.y) - (s2.y - t2.y) * (t1.x - s2.x);
      //   return s * t < 0 && u * v < 0;
    }

    function updateIntersectionCount() {
      let intersectionCount = 0;

      edges.forEach((edge1, i) => {
        const s1 = cy.getElementById(edge1.data.source).position();
        const t1 = cy.getElementById(edge1.data.target).position();
        edges.slice(i + 1).forEach((edge2) => {
          const s2 = cy.getElementById(edge2.data.source).position();
          const t2 = cy.getElementById(edge2.data.target).position();
          if (edgesIntersect(s1, t1, s2, t2)) {
            intersectionCount++;
            console.log(`Edge1: ${s1.x} -> ${t1.x}`);
            console.log(`Edge2: ${s2.x} -> ${t2.x}`);
          }
        });
      });

      console.log(`Edge Intersections: ${intersectionCount}`);
    }

    cy.on("position", "node", updateIntersectionCount);

    updateIntersectionCount();

    return () => {
      cy.off("position", "node", updateIntersectionCount);
      cy.destroy();
    };
  }, [binaryValue]);

  return (
    <div
      ref={containerRef}
      style={{ width: "1200px", height: "400px", border: "2px solid #a0522d" }}
    />
  );
});

export default CytoscapeComponent;

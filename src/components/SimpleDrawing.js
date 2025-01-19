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

    return () => {
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

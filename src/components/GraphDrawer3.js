import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

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

    useImperativeHandle(ref, () => ({
        png: () => graphRef.current ? graphRef.current.toPng() : null,
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
            if (binaryValue[i] === '0') {
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

        let w = 1, clique_siz = 1, node_id = 0;
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
                        id: `node${node_id}`,
                        label: `${clique_siz}`,
                        x: position.x,
                        y: position.y,
                        color: '#ff6347'
                    });
                    clique_siz = 1;
                    nodePositions[`node${node_id}`] = position;
                } else {
                    nodes.push({
                        id: `node${node_id}`,
                        label: `${node_id}`,
                        x: position.x,
                        y: position.y,
                        color: '#4169e1'
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
                id: `node${node_id}`,
                label: `${clique_siz}`,
                x: 100 * w,
                y: 100,
                color: '#ff6347'
            });
            nodePositions[`node${node_id}`] = { x: 100 * w, y: 100 };
        } else {
            nodes.push({
                id: `node${node_id}`,
                label: `${node_id}`,
                x: 100 * w,
                y: 100,
                color: '#4169e1'
            });
            nodePositions[`node${node_id}`] = { x: 100 * w, y: 100 };
        }

        // Process edges
        idx = 0;
        let edge_id = 0;
        let edgeSet = new Set();
        for (let i = 0; i < binaryValue.length; i++) {
            if (binaryValue[i] === '0') {
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
                                value: 1
                            });
                        }
                    }
                }
            }
        }

        setData({ nodes, links: edges });

    }, [binaryValue]);

    return (
        <ForceGraph2D
            ref={graphRef}
            graphData={data}
            nodeLabel="label"
            nodeAutoColorBy="color"
            linkColor={() => '#696969'}
            linkDirectionalParticles="value"
            linkDirectionalParticleSpeed={0.005}
            nodeRelSize={10}
            d3AlphaMin={1} // Disable layout adjustment
            d3VelocityDecay={1} // Stop velocity decay for fixed layout
            nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.label;
                const fontSize = 24 / globalScale;
                const nodeSize = 10;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.fillStyle = '#000000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                if (node.color === '#ff6347') {
                    ctx.fillStyle = node.color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false); // Red node
                    ctx.fill();
                    ctx.fillStyle = '#000000';
                    ctx.fillText(label, node.x, node.y);
                } else {
                    ctx.fillStyle = node.color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false); // Default node
                    ctx.fill();
                }
            }}
        />
    );
});

export default ForceDrawer;

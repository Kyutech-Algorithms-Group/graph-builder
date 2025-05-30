// components/CytoscapeComponent.js
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import cytoscape from 'cytoscape';

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

const GridDrawer = forwardRef(({ binaryValue }, ref) => {
    const containerRef = useRef(null);
    const cyRef = useRef(null);

    useImperativeHandle(ref, () => ({
        png: () => cyRef.current ? cyRef.current.png() : null,
    }));

    useEffect(() => {
        const cy = cytoscape({
            container: containerRef.current,
            elements: [],
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#4169e1',
                        'label': 'data(id)',
                        'width': '10px',
                        'height': '10px',
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 1,
                        'line-color': '#696969',
                    }
                },
                {
                    selector: 'edge.nonSequential',
                    style: {
                        'curve-style': 'unbundled-bezier',
                    }
                }
            ],
            layout: {
                name: 'grid',
                rows: 1
            }
        });

        cyRef.current = cy;  // Cytoscapeインスタンスを保存

        // start 手法に応じたグラフ構築処理を記述
        const nodes = [];
        const edges = [];
        const queue = [];
        let edge_id = 0;
        let idx = 0;

        let n = binaryValue.length / 2;
        // 隣接行列を作成
        let g = [];
        for (let i = 0; i < n; i++) {
            g.push([]);
        }
        // 自分自身を要素に追加
        for (let i = 0; i < n; i++) {
            g[i].push(i);
        }
        // 隣接行列を完成させる
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
        // 隣接行列をソート
        for (let i = 0; i < n; i++) {
            g[i].sort((a, b) => a - b);
        }
        // 隣接行列を元にノードとエッジを作成
        nodes.push({
            data: { id: `0`, label: `0` },
            position: { x: 100, y: 100 }
        });
        let h = 1, w = 1;
        let nodePositions = { '0': { x: 100, y: 100 } };
        for (let i = 1; i < n; i++) {
            let position;
            if (arraysEqual(g[i], g[i - 1])) {
                h++;
                position = { x: 100 * w, y: 100 * h };
            } else {
                w++;
                h = 1;
                position = { x: 100 * w, y: 100 };
            }
            nodes.push({
                data: { id: `${i}`, label: `${i}` },
                position: position
            });
            nodePositions[`${i}`] = position;
        }
        idx = 0;
        for (let i = 0; i < binaryValue.length; i++) {
            if (binaryValue[i] === '0') {
                queue.push(idx);
                idx++;
            } else {
                let node = queue.shift();
                for (let j = 0; j < queue.length; j++) {
                    let classes = '';
                    let sourcePosition = nodePositions[`${node}`];
                    let targetPosition = nodePositions[`${queue[j]}`];
                    if ((Math.abs(sourcePosition.x - targetPosition.x) >= 200 && sourcePosition.y === targetPosition.y) || (Math.abs(sourcePosition.y - targetPosition.y) >= 200 && sourcePosition.x === targetPosition.x)) {
                        classes = 'nonSequential';
                    }
                    edges.push({
                        data: {
                            id: `edge${edge_id++}`,
                            source: `${node}`,
                            target: `${queue[j]}`
                        },
                        classes: classes
                    });
                }
            }
        }

        cy.add(nodes);
        cy.add(edges);

        return () => {
            cy.destroy();
        };
    }, [binaryValue]);

    return <div ref={containerRef} style={{ width: '1200px', height: '640px', border: '2px solid #a0522d', margin: '5px' }} />;
});

export default GridDrawer;

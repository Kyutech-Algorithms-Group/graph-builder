import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

cytoscape.use(fcose);

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

const FcoseCliqueDrawer = forwardRef(({ binaryValue }, ref) => {
    const containerRef = useRef(null);
    const cyRef = useRef(null);
    const animationFrameRef = useRef(null);

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
                        // 'label': 'data(label)',
                        'width': '10px',
                        'height': '10px',
                        // 'font-size': '10px',
                        // 'text-valign': 'center',
                        // 'color': '#ffffff',
                    }
                },
                {
                    selector: 'node.clique',
                    style: {
                        'background-color': '#ff6347',
                        label: 'data(label)',
                        'width': '30px',
                        'height': '30px',
                        'font-size': '12px',
                        'text-valign': 'center',
                        'shape': 'rectangle',
                        'color': '#ffffff',
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

        cyRef.current = cy;

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
        // nodes.push({
        //     data: { id: `node0`, label: '0' },
        //     position: { x: 100, y: 100 }
        // });
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
                        data: { id: `node${node_id}`, label: `${clique_siz}` },
                        position: position,
                        classes: 'clique'
                    });
                    clique_siz = 1;
                    nodePositions[`node${node_id}`] = position;
                } else {
                    nodes.push({
                        data: { id: `node${node_id}`, label: `${node_id}` },
                        position: position
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
                position: { x: 100 * (w + 1), y: 100 },
                classes: 'clique'
            });
            nodePositions[`node${node_id}`] = { x: 100 * (w + 1), y: 100 };
        } else {
            nodes.push({
                data: { id: `node${node_id}`, label: `${node_id}` },
                position: { x: 100 * (w + 1), y: 100 }
            });
            nodePositions[`node${node_id}`] = { x: 100 * (w + 1), y: 100 };
        }

        // 辺の処理
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
                    let classes = '';
                    let sourceGroup = nodeGroupMapping[node];
                    let targetGroup = nodeGroupMapping[queue[j]];
                    let sourcePosition = nodePositions[`node${sourceGroup}`];
                    let targetPosition = nodePositions[`node${targetGroup}`];
                    // if ((Math.abs(sourcePosition.x - targetPosition.x) >= 200 && sourcePosition.y === targetPosition.y) || (Math.abs(sourcePosition.y - targetPosition.y) >= 200 && sourcePosition.x === targetPosition.x)) {
                    //     classes = 'nonSequential';
                    // }
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
                                    value: 1
                                },
                                classes: classes
                            });
                        }
                    }
                }
            }
        }
        // ノードの位置をずらす
        for (let edge of edges) {
            console.log(edge);
        }
        // 各ノードがsourceとして何回登場するかをカウント
        const sourceCount = {};
        for (let edge of edges) {
            const source = edge.data.source;
            if (!sourceCount[source]) {
                sourceCount[source] = 0;
            }
            sourceCount[source]++;
        }

        // 試作
        for (let edge of edges) {
            const source = edge.data.source;  // エッジの始点ノードID
            const target = edge.data.target;  // エッジの終点ノードID  (修正点)
            // 範囲のノードを対象とする処理
            for (let i = parseInt(source.replace('node', '')); i <= parseInt(target.replace('node', '')); i++) {
                const nodeId = `node${i}`;
                const node = nodes.find(node => node.data.id === nodeId);
                if (node) {
                    node.position.y += 100;  // ノードのy座標を100ピクセル下に移動
                }
            }
        }

        // for (let edge of edges) {
        //     const source = edge.data.source;
        //     const target = edge.data.target;
        //     for (let i = source; i <= target; i++) {
        //         // nodeSet.add(i);
        //         const nodeId = `node${i}`;
        //         const node = nodes.find(node => node.data.id === nodeId);
        //         node.position.y += 100;
        //     }
        // }

        // // sourceとして複数回登場するノードの位置を調整
        // for (let node of nodes) {
        //     const nodeId = node.data.id;
        //     if (sourceCount[nodeId] > 1) {
        //         // 同じsourceを持つエッジの数に応じて位置をオフセット
        //         // ここの処理を辺の区間における頂点のy軸のポジションを調整するように変更してくれ
        //         node.position.y += 100 * (sourceCount[nodeId] - 1);
        //     }
        // }

        cy.add(nodes);
        cy.add(edges);
        cy.layout({
            name: 'fcose',
            animate: true,
            fit: true,
            padding: 30,
            randomize: true,
            idealEdgeLength: 100,
            nodeRepulsion: 400000,
            edgeElasticity: 0.45,
            nestingFactor: 5,
            gravity: 0.5,
            numIter: 2500,
            initialTemp: 200,
            coolingFactor: 0.99,
            minTemp: 1.0
        }).run(); // ノードとエッジを追加後にレイアウトを再適用

        function drawParticles(context, source, target, value) {
            const numParticles = value;
            const date = Date.now();
            for (let i = 0; i < numParticles; i++) {
                const t = (date / 2000 + i / numParticles) % 1;
                const x = source.x * (1 - t) + target.x * t;
                const y = source.y * (1 - t) + target.y * t;
                context.beginPath();
                context.arc(x, y, 2, 0, 2 * Math.PI);
                context.fillStyle = '#4682b4';
                context.fill();
            }
        }

        function animateParticles() {
            const canvas = cyRef.current.container().querySelector('canvas');
            if (!canvas) return;
            const context = canvas.getContext('2d');
            // paddingの値を変更することでアニメーションのクリアリングを調整
            const padding = 5000;
            context.clearRect(-padding, -padding, canvas.width + 2 * padding, canvas.height + 2 * padding);
            cy.edges().forEach(edge => {
                const source = edge.source().position();
                const target = edge.target().position();
                const value = edge.data('value') || 1;
                drawParticles(context, source, target, value);
            });
            animationFrameRef.current = requestAnimationFrame(animateParticles);
        }

        animateParticles();

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
            cy.destroy();
        };
    }, [binaryValue]);

    return <div ref={containerRef} style={{ width: '100%', height: '640px', border: '2px solid #a0522d', margin: '5px' }} />;
});

export default FcoseCliqueDrawer;

// components/CytoscapeComponent.js
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

cytoscape.use(fcose);

const FcoseDrawer = forwardRef(({ binaryValue }, ref) => {
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
                        'background-color': '#666',
                        'label': 'data(id)',
                        'width': '10px',
                        'height': '10px',
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 1,
                        'line-color': '#999999',
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
                name: 'fcose',
                animate: true,
                fit: true,
                padding: 30,
                randomize: true, // 追加
                idealEdgeLength: 50, // 追加
                nodeRepulsion: 4500, // 追加
                edgeElasticity: 0.45, // 追加
                nestingFactor: 0.1, // 追加
                gravity: 0.25, // 追加
                numIter: 2500, // 追加
                initialTemp: 200, // 追加
                coolingFactor: 0.99, // 追加
                minTemp: 1.0 // 追加
            }
        });

        cyRef.current = cy;  // Cytoscapeインスタンスを保存

        const nodes = [];
        const edges = [];
        const queue = [];
        let edge_id = 0;
        let idx = 0;

        // バイナリ文字列を元にノードとエッジを作成
        for (let i = 0; i < binaryValue.length / 2; i++) {
            nodes.push({ data: { id: `node${i}`, label: `{i}` } });
        }
        for (let i = 0; i < binaryValue.length; i++) {
            if (binaryValue[i] === '0') {
                queue.push(idx);
                idx++;
            } else {
                let node = queue.shift();
                for (let j = 0; j < queue.length; j++) {
                    let classes = '';
                    // if (Math.abs(node - queue[j]) > 1) {
                    //     classes = 'nonSequential';
                    // }
                    edges.push({
                        data: {
                            id: `edge${edge_id++}`,
                            source: `node${node}`,
                            target: `node${queue[j]}`
                        },
                        classes: classes
                    });
                }
            }
        }

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
            const padding = 1000;
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

export default FcoseDrawer;

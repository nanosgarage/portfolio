// no longer used.

import * as THREE from 'three'
function setupPaths(panels){
    let lines = [];
    panels.forEach(panel => {
        const points = [
            new THREE.Vector3(0, 0, 0),
            panel.position.clone()
        ]

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({color: 0xffffff});
        const line = new THREE.Line(geometry, material);

        line.tick = (time) => {
            const positions = line.geometry.attributes.position.array;
            let panelCoords = panel.children[0].localToWorld(new THREE.Vector3(0,0,0));
            positions[3] = panelCoords.x;
            positions[4] = panelCoords.y;
            positions[5] = panelCoords.z -0.1;

            line.geometry.attributes.position.needsUpdate = true;
        }
        lines.push(line);
    });
    return lines;
}

export {setupPaths}
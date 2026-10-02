import * as THREE from "three";
function setupSectionContainer(isWide){
    const size = isWide ? {width: 10, height: 6} : {width: 10, height: 8};

    const geometry = new THREE.PlaneGeometry(size.width, size.height);
    const edges = new THREE.EdgesGeometry(geometry);
    const container = new THREE.LineSegments(edges);
    container.userData.size = size;

    return container;
}

export {setupSectionContainer};
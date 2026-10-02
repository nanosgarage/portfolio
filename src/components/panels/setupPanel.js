import * as THREE from 'three';

const Directories = Object.freeze({
    DEFAULT: 0,
    PORTFOLIO: 1,
    ABOUT: 2,
    DOWNLOADS: 3,
    CONTACT: 4,
});

function setupPanel(data){
    const clickable = true;
    const wrapper = new THREE.Group();
    const panel = data.scene.children[0];
    wrapper.add(panel);
    wrapper.name = panel.name;
    wrapper.scale.setScalar(0.5);
    switch(panel.name){
        case "Portfolio":
            panel.userData.directory = Directories.PORTFOLIO;
            break;
        case "About":
            panel.userData.directory = Directories.ABOUT;
            break;
        case "Downloads":
            panel.userData.directory = Directories.DOWNLOADS;
            break;
        case "Contact":
            panel.userData.directory = Directories.CONTACT;
            break;

    }
    panel.userData.clickable = true;
    panel.userData.isHovered = false;
    panel.userData.baseY = panel.position.y;
    panel.userData.baseX = panel.position.x;
    panel.userData.baseScale = panel.scale.x;

    const speed = 0.4;
    const floatAmount = 0.06;
    const seed = Math.random() + 5 * Math.random() + 10;

    const hoverScale = 1.15;
    const lerpSpeed = 0.1;

    panel.material.dithering = true;

    wrapper.tick = (time) => {
        const timeinS = time / 1000;
        panel.position.y = panel.userData.baseY + Math.sin(seed + timeinS * speed) * floatAmount;
        panel.position.x = panel.userData.baseX +  Math.sin(seed + timeinS * speed) * floatAmount;
        const targetScale = panel.userData.isHovered ? panel.userData.baseScale * hoverScale : panel.userData.baseScale;

        panel.scale.setScalar(THREE.MathUtils.lerp(panel.scale.x, targetScale, lerpSpeed));
    }

    return wrapper;
}

export {setupPanel};
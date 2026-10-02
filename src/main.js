import * as THREE from 'three'
import { loadPanels } from './components/panels/loadPanels';
import { setupSectionContainer } from './components/sectionContent/setupSectionContainer';
import { createSectionContent } from './components/sectionContent/SectionContent';
import { SECTION_CONTENT } from './components/sectionContent/sectionTemplates';
import { SdfOverlay } from './components/shaders/sdfOverlay';

const clock = new THREE.Timer();
clock.connect(document);
let delta = 0;
const interval = 1 / 60;

export const BASE_VIEW_SIZE = 15;

// Default camera position.
const HOME = new THREE.Vector3(0, 0, 1);

// Where each box sits.
const SECTION_LAYOUT = {
    portfolio: { wide: true,  x: 0,     y: 7.5 },
    downloads: { wide: true,  x: 0,     y: -7.5 },
    about:     { wide: false, x: -10.5, y: 0 },
    contact:   { wide: false, x: 10.5,  y: 0 },
};

const scene = new THREE.Scene();
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});
const updateables = [];
let INTERSECTED;
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

// Reused every frame (avoids creating new vectors 60x a second)
const _topLeft = new THREE.Vector3();
const _bottomRight = new THREE.Vector3();


class World{
    constructor() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.OrthographicCamera(
            (BASE_VIEW_SIZE * aspect) / - 2,
            (BASE_VIEW_SIZE * aspect) / 2,
            BASE_VIEW_SIZE / 2,
            BASE_VIEW_SIZE / -2,
            0.1,
            1000
        );
        this.cameraTarget = HOME.clone();

        this.targetZoom = 1;
        this.activeContainer = null;
        this.containers = {};
        this.panels = [];  

        this.camera.position.copy(HOME);
        this.camera.lookAt(scene.position);
        scene.add(this.camera);

        scene.background = new THREE.Color(0x0043FF);


        renderer.setSize(window.innerWidth, window.innerHeight);
        //pixel ratio setting optional here imo waste of GPU for look of site.
        renderer.setAnimationLoop((time) => this.animate(time));

        document.addEventListener('mousemove', (e) => this.onPointerMove(e));
        // Listen on the canvas only, so clicks inside the HTML content don't hit panels behind it.
        canvas.addEventListener('mousedown', (e) => this.onPointerClick(e));
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.goHome();
        });
    }

    async init(){
        //array destructuring.
        for (const [name, layout] of Object.entries(SECTION_LAYOUT)) {
            const container = setupSectionContainer(layout.wide);
            container.visible = false;
            container.position.set(layout.x, layout.y, -1);

            const { title, html } = SECTION_CONTENT[name];
            container.userData.content = createSectionContent(title, html, () => this.goHome());

            this.containers[name] = container;
            scene.add(container);
        }

        const { portfolioPanel, aboutPanel, downloadsPanel, contactPanel } = await loadPanels();

        portfolioPanel.children[0].userData.targetContainer = this.containers.portfolio;
        aboutPanel.children[0].userData.targetContainer = this.containers.about;
        downloadsPanel.children[0].userData.targetContainer = this.containers.downloads;
        contactPanel.children[0].userData.targetContainer = this.containers.contact;

        portfolioPanel.position.set(0, 2.5, -1);
        aboutPanel.position.set(-2.5, 0, -1);
        downloadsPanel.position.set(0, -2.5, -1);
        contactPanel.position.set(2.5, 0, -1);

        this.panels.push(portfolioPanel, aboutPanel, downloadsPanel, contactPanel);
        scene.add(...this.panels);
        updateables.push(...this.panels);

        this.panels.forEach((panel, i) => {
            panel.children[0].userData.buttonIndex = i;
        });

        this.sdf = new SdfOverlay({color :0x005bfd, rimColor : 0x0000ef});
        this.sdf.setButtons(this.panels);
        scene.add(this.sdf.mesh);
        updateables.push(this.sdf);

        this.panels.forEach((panel, i) => {
            panel.children[0].userData.buttonIndex = i;
        })
    }

    focusContainer(container){
        if (!container)
            return;
        this.activeContainer = container;

        const aspect = window.innerWidth / window.innerHeight;
        const {width, height} = container.userData.size;
        const padding = 1.25;

        const requiredHeight = Math.max(height * padding, (width * padding) / aspect);
        //We only need height as width is decided by height and aspect. We just need a height to show enough of the container.
        // For horizontal, window width = window height x aspect 
        this.cameraTarget.set(container.position.x, container.position.y, 1);
        this.targetZoom = BASE_VIEW_SIZE / requiredHeight;
    }

    goHome(){
        this.activeContainer = null;
        this.cameraTarget.copy(HOME);
        this.targetZoom = 1;
        this.sdf.close();
    }

    // Lines each box's HTML up with where the box is on screen.
    updateOverlays(){
        const w = renderer.domElement.clientWidth;
        const h = renderer.domElement.clientHeight;

        // Only show the content once the camera has almost arrived.
        const settled =
            this.camera.position.distanceTo(this.cameraTarget) < 0.4 &&
            Math.abs(this.camera.zoom - this.targetZoom) < 0.3;

        for (const container of Object.values(this.containers)) {
            const el = container.userData.content;
            el.classList.toggle('active', container === this.activeContainer && settled);

            // Project the box's top-left and bottom-right corners from world space to pixels.
            const { width, height } = container.userData.size;
            const p = container.position;
            _topLeft.set(p.x - width / 2, p.y + height / 2, p.z).project(this.camera);
            _bottomRight.set(p.x + width / 2, p.y - height / 2, p.z).project(this.camera);

            const left = (_topLeft.x + 1) / 2 * w;
            const top = (1 - _topLeft.y) / 2 * h;
            const right = (_bottomRight.x + 1) / 2 * w;
            const bottom = (1 - _bottomRight.y) / 2 * h;
            const boxHeight = bottom - top;

            el.style.transform = `translate(${left}px, ${top}px)`;
            el.style.width = `${right - left}px`;
            el.style.height = `${boxHeight}px`;
            // Text scales with the box, but never below 12px.
            el.style.fontSize = `${Math.max(12, boxHeight / 40)}px`;
        }
    }

    onWindowResize(){

        const aspect = window.innerWidth / window.innerHeight;
        this.camera.left = (BASE_VIEW_SIZE * aspect) / -2;
        this.camera.right = (BASE_VIEW_SIZE * aspect) / 2;

        this.camera.top = BASE_VIEW_SIZE / 2;
        this.camera.bottom = BASE_VIEW_SIZE / -2;
        this.camera.updateProjectionMatrix();

        if (this.activeContainer) {
            this.focusContainer(this.activeContainer);
        }

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    animate(time){
        clock.update(time);
        delta += clock.getDelta();
        if(delta > interval){
            this.tick(time);

            this.camera.position.lerp(this.cameraTarget, 0.11);
            this.camera.zoom = THREE.MathUtils.lerp(this.camera.zoom, this.targetZoom, 0.11);
            this.camera.updateProjectionMatrix();

            raycaster.setFromCamera(pointer, this.camera);
            const intersects = raycaster.intersectObjects(this.panels, true);

            if (intersects.length > 0){
                if ( INTERSECTED != intersects[0].object) {
                    if (INTERSECTED && INTERSECTED.userData.clickable){
                        INTERSECTED.userData.isHovered = false;
                    }
                    INTERSECTED = intersects[0].object;

                    if(INTERSECTED.userData.clickable){
                        INTERSECTED.userData.isHovered = true;
                    }
                }
            } else {
                if (INTERSECTED && INTERSECTED.userData.clickable){
                    INTERSECTED.userData.isHovered = false;
                }
                INTERSECTED = null;
            }

            canvas.style.cursor = (INTERSECTED && INTERSECTED.userData.clickable) ? 'pointer' : 'default';

            this.updateOverlays();
            renderer.render(scene, this.camera);
            delta = delta % interval;
        };

    }

    tick(time){
        for (const object of updateables){
            object.tick(time);
        }
    }

    onPointerMove( event ){
        pointer.x = ( event.clientX / window.innerWidth) * 2 -1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    onPointerClick(event){
        if (INTERSECTED && INTERSECTED.userData.targetContainer) {
            const target = INTERSECTED.userData.targetContainer;
            this.focusContainer(target);
            this.sdf.openTo(INTERSECTED.userData.buttonIndex, target);
        } else if (this.activeContainer) {
            // Clicking empty space while a section is open goes back.
            this.goHome();
        }
    }
};


async function main(){
    const world = new World();
    await world.init();
}

main().catch((err) => {
    console.error(err);
})


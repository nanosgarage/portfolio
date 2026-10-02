import * as THREE from "three";
import { setupPanel } from "./setupPanel";
import { GLTFLoader } from "three/examples/jsm/Addons.js";


async function loadPanels(){
    const loader = new GLTFLoader();

    const [portfolioData, aboutData, downloadsData, contactData] = await Promise.all([
        loader.loadAsync('/3D/Portfolio.glb'), 
        loader.loadAsync('/3D/About.glb'),
        loader.loadAsync('/3D/Downloads.glb'),
        loader.loadAsync('/3D/Contact.glb')
    ])
    const makeTransparent = (gltfData) => {
        gltfData.scene.traverse((child) => {
            // Check if the item is a mesh and has a material
            if (child.isMesh && child.material) {
                if(child.material.map){
                    child.material.map.magFilter = THREE.NearestFilter;
                    child.material.map.minFilter = THREE.NearestFilter;
                }
                // IF YOUR IMAGE IS A PNG WITH A TRANSPARENT BACKGROUND:
                //child.material.transparent = true;
                //child.material.alphaTest = 0.5; // Helps prevent overlapping depth-sorting glitches
                
                // IF YOUR IMAGE IS SOLID BLACK WITH WHITE TEXT (e.g., a JPG):
                // Comment out the two lines above, and uncomment the line below. 
                // Additive blending makes black invisible and white glow brightly.
                child.material.blending = THREE.AdditiveBlending; 
            }
        });
    };

    // 2. Run the helper function on each loaded panel
    makeTransparent(portfolioData);
    makeTransparent(aboutData);
    makeTransparent(downloadsData);
    makeTransparent(contactData);

    const portfolioPanel = setupPanel(portfolioData);
    const aboutPanel = setupPanel(aboutData);
    const downloadsPanel = setupPanel(downloadsData);
    const contactPanel = setupPanel(contactData);
    return {
        portfolioPanel, aboutPanel, downloadsPanel, contactPanel
    };
}

export {loadPanels};
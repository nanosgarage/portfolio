import * as THREE from 'three';
import vertex from './glsl/blobs.vert';
import fragment from './glsl/blobs.frag';
//fps settings
const clock = new THREE.Timer();
clock.connect(document);
let delta = 0;
const interval = 1 / 240;


const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 1; //why need this?
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(1.0);
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const uniforms = {
  u_resolution: {value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
  u_time: {value: 0.0},
}

const material = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: uniforms,
});

const geometry = new THREE.PlaneGeometry(2,2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);


function animate( time ) {
  requestAnimationFrame(animate);
  if(resizeRendererToDisplaySize(renderer)){
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  clock.update(time);
  delta += clock.getDelta();
  if(delta > interval) {
    uniforms.u_time.value = time * 0.001; //in seconds
    renderer.render( scene, camera );
    delta = delta % interval;
  }
}

function resizeRendererToDisplaySize(renderer){
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if(needResize){
    renderer.setSize(width, height, false);
  }
  return needResize;
}

animate(0);
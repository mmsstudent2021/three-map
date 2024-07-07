import "./style.css";
import * as THREE from "three";
import { Pane } from "tweakpane";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import * as dat from 'dat.gui';



const pane = new Pane();

const canvas = document.querySelector("canvas.webgl");

/**Scene */
const scene = new THREE.Scene();

/** Texture Loader */
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();



const albedoTexture =  textureLoader.load('/textures/space/albedo.png')
const aoTexture =  textureLoader.load('/textures/space/ao.png')
const heighTexture = textureLoader.load('/textures/space/height.png')
const normalTexture = textureLoader.load('/textures/space/normal.png')
const metalTexture = textureLoader.load('/textures/space/metallic.png');
const roughnesTexture = textureLoader.load('/textures/space/roughness.png')




const environmentMap = cubeTextureLoader.load([
 "textures/environmentMaps/0/px.png",
 "textures/environmentMaps/0/nx.png",
 "textures/environmentMaps/0/py.png",
 "textures/environmentMaps/0/ny.png",
 "textures/environmentMaps/0/pz.png",
 "textures/environmentMaps/0/nz.png"
])

let mixer = null
gltfLoader.load(
  '/models/plane.glb', 
  (gltf)=>{
    console.log(gltf)
    
    scene.add(gltf.scene)
    
    gltf.scene.scale.setScalar(0.03)

    // mixer 
    mixer = new THREE.AnimationMixer(gltf.scene)
    const action = mixer.clipAction(gltf.animations[0])
    action.play() 
});




/**
 * Lights
 */
// initialize the light
const light = new THREE.AmbientLight(0xffffff, 3);
scene.add(light);

const pointLight = new THREE.PointLight(0xffffff, 1.2);
pointLight.position.set(3, 3, 3);
scene.add(pointLight);




/** Sphere Geometry  */
const sphereGeometry = new THREE.SphereGeometry(1.4, 20, 20);
const uv2Geometry = new THREE.BufferAttribute(sphereGeometry.attributes.uv.array, 2)
sphereGeometry.setAttribute('uv2', uv2Geometry)



/** Sphere Material */
const sphereMaterial = new THREE.MeshStandardMaterial();
sphereMaterial.map = albedoTexture
sphereMaterial.roughnessMap = roughnesTexture
sphereMaterial.metalnessMap = metalTexture
sphereMaterial.normalMap = normalTexture
sphereMaterial.displacementMap = heighTexture
sphereMaterial.aoMap = aoTexture

sphereMaterial.metalness = 1; 
sphereMaterial.roughness = 0;
sphereMaterial.displacementScale = 0.1;
sphereMaterial.aoMapIntensity = 0.5;



pointLight.intensity =  1;



/**
 * Controls
 */
const Group1 = pane.addFolder({
  title: ' Sphere',
  expanded: true
})




// Add event listeners to store the values when they change
Group1.addBinding(sphereMaterial, 'metalness', { min: 0, max: 1, step: 0.01 });
Group1.addBinding(sphereMaterial, 'roughness', { min: 0, max: 1, step: 0.01 });
Group1.addBinding(sphereMaterial, 'displacementScale', { min: 0, max: 1, step: 0.01 });
Group1.addBinding(sphereMaterial, 'aoMapIntensity', { min: 0, max: 1, step: 0.01 });
Group1.addBinding(pointLight, 'intensity', { min: 0, max: 10, step: 0.01 });
Group1.addBinding(light, 'intensity', { min: 0, max: 1.5, step: 0.01 });


/**
 * Controls End
 */

/**
 * Mesh
 */
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
// scene.add(sphereMesh)

/**
 * Environment Factors
 */

scene.background = environmentMap,
sphereMaterial.envMap = environmentMap,


//Resize Event
window.addEventListener("resize", () => {
  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// initialize the camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 10;
camera.position.y = 0

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias : true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true


const clock = new THREE.Clock();
let previousTime = 0

const renderLoop = () => {
  const elapsedTime = clock.getElapsedTime();

  const deltaTime = elapsedTime - previousTime;
  sphereMesh.rotation.y = 0.1 * elapsedTime;

  // Update controls
  controls.update();

  if(mixer) {
    mixer.update(deltaTime)
  }
  // Update Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(renderLoop);
};

renderLoop();

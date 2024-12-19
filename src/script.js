import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import GUI from "lil-gui";
import earthVertexShader from "./shaders/earth/vertex.glsl";
import earthFragmentShader from "./shaders/earth/fragment.glsl";
import atmosphereVertexShader from "./shaders/atmosphere/vertex.glsl"
import atmosphereFragmentShader from "./shaders/atmosphere/fragment.glsl"
import flareVertexShader from "./shaders/sunFlare/vertex.glsl"
import flareFragmentShader from "./shaders/sunFlare/fragment.glsl"


/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();

const textureFlare0 = textureLoader.load('lenses/lensflare0.png')
const textureFlare1 = textureLoader.load('lenses/lensflare1.png')


/**
 * SUN
 */

// Geometry and material
const sunLight = new THREE.PointLight(0xffffff, 1.5, 3000);
//sunLight.scale.set(3,3,3)

// Phi / Theta / sphereical / positin (vec 3)
const phi = 1.5;
const phiMin = Math.PI / 2 - 0.41;
const phiMax = Math.PI / 2 + 0.41;
const theta = 4.82;
const dist = 10; // This is the radius
const sunSpherical = new THREE.Spherical(dist, phi, theta);
const sunPosition = new THREE.Vector3();
// Dont forget to update the suns positino first

// set the sun position
//sunPosition.setFromSpherical(sunSpherical);

// Sun geometry and mesh
const sunGeometry = new THREE.SphereGeometry(0.5, 16, 16); // Small sphere
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700})
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.copy(sunLight.position); // Sync position with the PointLight

// Add to scene
scene.add(sunMesh);
scene.add(sunLight);

// Update on start
updateSunPosition();

/*
      Lense flare
*/
// Add a visible sphere to represent the light source

// Sun Gui
const sunFolder = gui.addFolder("Sun");
// Add GUI controls for phi and theta
sunFolder
  .add(sunSpherical, "phi", 0, Math.PI)
  .step(0.01)
  .min(phiMin)
  .max(phiMax)
  .name("Phi")
  .onChange(() => {
    updateSunPosition();
  });

sunFolder
  .add(sunSpherical, "theta", 0, 2 * Math.PI)
  .step(0.01)
  .name("Theta")
  .onChange(() => {
    updateSunPosition();
  });

sunFolder
  .add(sunSpherical, "radius", 0, 2 * Math.PI)
  .step(0.1)
  .min(3)
  .max(10)
  .name("Distance")
  .onChange(() => {
    updateSunPosition();
  });

// Function to update the sun's position based on phi and theta
function updateSunPosition() {
  sunSpherical.phi = sunSpherical.phi;
  sunSpherical.theta = sunSpherical.theta;
  sunSpherical.radius = sunSpherical.radius;
  sunPosition.setFromSpherical(sunSpherical);
  sunLight.position.copy(sunPosition);
  sunMesh.position.copy(sunPosition)
  //atmosphereMaterial.uniforms.uSunPosition.value.copy(sunPosition)
}

/**
 * Earth
 */
// Color
const earthParameters = {};
earthParameters.atmosphereDayColor = "#00aaff";
earthParameters.atmosphereTwilightColor = "#ff6600";
// Textures
const earthDayTexture = textureLoader.load("./earth/day.jpg");
earthDayTexture.colorSpace = THREE.SRGBColorSpace;
earthDayTexture.anisotropy = 8;

const earthNightTexture = textureLoader.load("./earth/night.jpg");
earthNightTexture.colorSpace = THREE.SRGBColorSpace;
earthNightTexture.anisotropy = 8;

const earthSpecularCloudsTexture = textureLoader.load(
  "./earth/specularClouds.jpg"
);
earthSpecularCloudsTexture.anisotropy = 8;

// Mesh
const earthRadius = 2
const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
const earthMaterial = new THREE.ShaderMaterial({
  vertexShader: earthVertexShader,
  fragmentShader: earthFragmentShader,
  uniforms: {
    uDayTexture: new THREE.Uniform(earthDayTexture),
    uNightTexture: new THREE.Uniform(earthNightTexture),
    uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
    uSunPosition: new THREE.Uniform(sunLight.position),
    uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
    uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor))
  },
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// GUI
const earthFolder = gui.addFolder("Earth");
earthFolder.addColor(earthParameters, 'atmosphereDayColor')
.onChange(()=>{
  earthMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
  atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
})
earthFolder.addColor(earthParameters, 'atmosphereTwilightColor')
.onChange(()=>{
  earthMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor)
  atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor)
})

// Atmosphere
const atmosphereMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  fragmentShader: atmosphereFragmentShader,
  vertexShader: atmosphereVertexShader,
  uniforms: {
    uSunPosition: new THREE.Uniform(sunLight.position),
    uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
    uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor))
  },
});

const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial)
atmosphere.scale.set(1.04, 1.04, 1.04)    // set the atmosphere relavent to the earth size
scene.add(atmosphere)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 12;
camera.position.y = 5;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor("#000011");
renderer.setClearAlpha = true

/*
  Post processing
*/
const renderTarget = new THREE.WebGLRenderTarget(
  sizes.width,
  sizes.height,
  //reactivate antalias

  { samples: renderer.getPixelRatio() <= 2 ? 3 : 0 }
);
// Set up
const composer = new EffectComposer(renderer, renderTarget)
// Project the sun position to screen space

const sunFlareShader = {
  uniforms: {
      lightPosition: { value: new THREE.Vector2(0.5, 0.5) }, // Sun position in screen space
      intensity: { value: 1.5 }, // Flare intensity
  },
  vertexShader: flareVertexShader,
  fragmentShader: flareFragmentShader,
};

const sunFlarePass = new ShaderPass(sunFlareShader)
//composer.addPass(sunFlarePass)

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {

  const elapsedTime = clock.getElapsedTime();

  earth.rotation.y = elapsedTime * 0.1;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
  //Apply post-processing
  composer.render()



  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

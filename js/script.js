import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scale= 0.8

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth*scale, window.innerHeight*scale);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.querySelector('.canvas-container').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25/scale, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(4, 0, 11);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.minDistance = 4;
controls.maxDistance = 25;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

const labelContainer = document.createElement('div');
labelContainer.style.position = 'absolute';
labelContainer.style.top = '0';
labelContainer.style.left = '0';
labelContainer.style.width = '100%';
labelContainer.style.height = '100%';
labelContainer.style.pointerEvents = 'none';
document.body.appendChild(labelContainer);

const loader = new GLTFLoader();
loader.load('MAP.glb', (gltf) => {
  console.log('loading model');
  const mesh = gltf.scene;

  mesh.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  mesh.position.set(0, 1.05, -1);
  scene.add(mesh);
  
  document.getElementById('progress-container').style.display = 'none';

  //points of interest
  const points = [
    { 
      position: new THREE.Vector3(-0.45, 1.1, -1.09), 
      name: 'Ancient Ruins', 
      url: 'index.html' 
    },
    { 
      position: new THREE.Vector3(1.95, 1.1, 0.5), 
      name: 'Research Base Alpha', 
      url: 'index.html' 
    },
    { 
      position: new THREE.Vector3(3.95, 1.1, 0.5), 
      name: 'Research Base Alpha', 
      url: 'index.html' 
    },
  ];

  //markers
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00, emissive: 0xffcc00, emissiveIntensity: 1 });
  points.forEach(point => {
    const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(point.position);
    marker.name = point.name;
    scene.add(marker);

// labels
    const labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    labelDiv.textContent = point.name;
    labelContainer.appendChild(labelDiv);
    marker.userData.label = labelDiv;

    labelDiv.addEventListener('click', () => {
      zoomToLabel(point.position, point.url);
    });
  });

}, (xhr) => {
  console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
}, (error) => {
  console.error(error);
});

document.addEventListener('mousedown', onDocumentMouseDown, false);

function onDocumentMouseDown(event) {
  event.preventDefault();
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth*scale) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight*scale) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children);
  intersects.forEach((intersect) => {
    if (intersect.object.callback) intersect.object.callback();
  });
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth*scale / window.innerHeight*scale;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth*scale, window.innerHeight*scale);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);

  const container = document.querySelector('.canvas-container');
  const containerRect = container.getBoundingClientRect();

  const yOffsetLookup = {
    0.4: -0.55,
    0.5: -0.47,
    0.6: -0.48,
    0.7: -0.22,
    0.8: 1.85,
    0.9: +1.45,
    1.0: -0.12,
  };
  

  const yOffsetAdjustment = containerRect.height*yOffsetLookup[scale];

  scene.children.forEach(child => {
    if (child.userData.label) {
      const screenPosition = child.position.clone().project(camera);
      const label = child.userData.label;

      const x = (screenPosition.x * 0.5 + 0.5) * containerRect.width;
      const y = ((1 - screenPosition.y * 0.5) * containerRect.height) + yOffsetAdjustment;

      label.style.left = `${containerRect.left + x}px`;
      label.style.top = `${containerRect.top + y}px`;
      label.style.transform = 'translate(-50%, -50%)'; 

      label.style.display = screenPosition.z > -1 && screenPosition.z < 1 ? 'block' : 'none';
    }
  });
}
animate();

//zoom aniamation
function zoomToLabel(targetPosition, url) {
  const startPosition = camera.position.clone();
  const tweenDuration = 600; 
  let start = null;

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function animateZoom(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / tweenDuration, 1);
    const easedProgress = easeInOut(progress);

    camera.position.lerpVectors(startPosition, targetPosition, easedProgress);
    camera.lookAt(targetPosition);

    if (progress < 1) {
      requestAnimationFrame(animateZoom);
    } else {
      camera.position.copy(targetPosition);
      window.location.href = url;
    }
  }

  requestAnimationFrame(animateZoom);
}
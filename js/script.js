import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(4, 5, 11);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
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
      url: 'dashboard.html' 
    },
    { 
      position: new THREE.Vector3(1.95, 1.1, 0.5), 
      name: 'Research Base Alpha', 
      url: 'sign in.html' 
    },
    { 
      position: new THREE.Vector3(3.95, 1.1, 0.5), 
      name: 'Research Base Alpha', 
      url: 'sign in.html' 
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
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children);
  intersects.forEach((intersect) => {
    if (intersect.object.callback) intersect.object.callback();
  });
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);

  scene.children.forEach(child => {
    if (child.userData.label) {
      const screenPosition = child.position.clone().project(camera);
      const label = child.userData.label;
      const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
      const y = (1 - screenPosition.y * 0.5) * window.innerHeight;
      label.style.left = `${x}px`;
      label.style.top = `${y-(window.innerHeight*0.05)}px`;
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
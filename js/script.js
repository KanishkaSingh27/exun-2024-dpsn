import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

  // Add points of interest as visible markers with glowing effect
  const points = [
    { position: new THREE.Vector3(1, 1.5, -2), name: 'Ancient Ruins' },
    { position: new THREE.Vector3(-1, 1.2, 1), name: 'Research Base Alpha' },
    // Add more points as needed
  ];

  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00, emissive: 0xffcc00, emissiveIntensity: 1 });
  points.forEach(point => {
    const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(point.position);
    marker.name = point.name;
    scene.add(marker);

    // Create a label for each marker
    const labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    labelDiv.textContent = point.name;
    labelDiv.style.position = 'absolute';
    labelDiv.style.color = 'white';
    labelDiv.style.fontSize = '14px';
    labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    document.body.appendChild(labelDiv);

    // Update label position in animation loop
    marker.userData.label = labelDiv;

    // Event listener for marker click
    marker.callback = () => {
      alert(`You clicked on ${point.name}`);
      // Replace with your modal or tooltip logic
    };
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

}, (xhr) => {
  console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
}, (error) => {
  console.error(error);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);

  // Update label positions
  points.forEach(point => {
    const screenPosition = point.position.clone();
    screenPosition.project(camera);

    const label = point.userData.label;
    const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
    const y = (1 - screenPosition.y * 0.5 - 0.5) * window.innerHeight;
    label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    label.style.display = (screenPosition.z > -1 && screenPosition.z < 1) ? 'block' : 'none';
  });
}

animate();

document.addEventListener("DOMContentLoaded", () => {
  const question = document.getElementById("question");
  const enter = document.getElementById("enter");
  const modal = document.querySelector(".landing-page");

  enter.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  question.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });
  
  // 3D rendering
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;
  const VIEW_ANGLE = 45;
  const ASPECT = WIDTH / HEIGHT;
  const NEAR = 0.1;
  const FAR = 10000;
  const container = document.getElementById("container");

  const renderer = new THREE.WebGLRenderer();
  const camera = new THREE.PerspectiveCamera(
    VIEW_ANGLE, ASPECT, NEAR, FAR);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  scene.add(camera);
  renderer.setSize(WIDTH, HEIGHT);
  container.appendChild(renderer.domElement);

  // const listener = new THREE.AudioListener();

  const RADIUS = 50;
  const SEGMENTS = 16;
  const RINGS = 16;

  const sphereMaterial = new THREE.MeshLambertMaterial(
    { color: 0xCC0000 });

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(
      RADIUS, SEGMENTS, RINGS
    ), sphereMaterial);

  camera.position.z = 500;
  scene.add(sphere);

  const pointLight = new THREE.PointLight(0xFFFFFF);
  pointLight.position.x = 10;
  pointLight.position.y = 50;
  pointLight.position.z = 130;
  scene.add(pointLight);

  function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

});

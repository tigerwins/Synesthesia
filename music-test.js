$(function() {
  const question = document.getElementById("question");
  const enter = document.getElementById("enter");
  const modal = document.querySelector(".landing-page");

  enter.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  question.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  // const ctx = new (window.AudioContext || window.webkitAudioContext)();
  // const audio = document.getElementById("myAudio");
  // const audioSrc = ctx.createMediaElementSource(audio);
  // const analyzer = ctx.createAnalyser();
  //
  // audioSrc.connect(analyzer);
  // audioSrc.connect(ctx.destination);
  // const frequencyData = new Uint8Array(analyzer.frequencyBinCount);

  let cube, cubeMaterial, cubeGeometry;
  let scene, camera, renderer;
  let controls, guiControls, datGUI;
  let axis, grid, color, fov;
  let spotLight;
  let stats;
  let WIDTH, HEIGHT;

  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  const VIEW_ANGLE = 45;
  const ASPECT = WIDTH / HEIGHT;
  const NEAR = 0.1;
  const FAR = 10000;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);
  camera = new THREE.PerspectiveCamera(
    VIEW_ANGLE, ASPECT, NEAR, FAR);

  const listener = new THREE.AudioListener();
  camera.add(listener);

  let sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();

  // audioLoader.load("music/instrumental-4.mp3", (buffer) => {
  //   sound.setBuffer(buffer);
  //   sound.setLoop(false);
  //   sound.setVolume(0.5);
  //   sound.play();
  // });

  let ctx, analyzer, song, sourceNode;

  const instrumental = document.querySelector(".instrumental");

  function setup() {
    song.addEventListener("canplay", () => {
      debugger
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      analyzer = ctx.createAnalyser();

      analyzer.smoothingTimeConstant = 0.1;
      analyzer.fftSize = 1024;

      startSound();
    });
  }

  instrumental.addEventListener("click", () => {
    song = document.querySelector("#myAudio");
    debugger
    setup();
    // song.play();
  });

  function startSound() {
    sourceNode = ctx.createMediaElementSource(song);
    sourceNode.connect(analyzer);
    sourceNode.connect(ctx.destination);
    debugger
    song.play();
  }



  // setup();

  // function init() {
  //   WIDTH = window.innerWidth;
  //   HEIGHT = window.innerHeight;
  //   const VIEW_ANGLE = 45;
  //   const ASPECT = WIDTH / HEIGHT;
  //   const NEAR = 0.1;
  //   const FAR = 10000;
  //
  //   scene = new THREE.Scene();
  //   scene.background = new THREE.Color(0x111111);
  //   camera = new THREE.PerspectiveCamera(
  //     VIEW_ANGLE, ASPECT, NEAR, FAR);
  //
  //     renderer = new THREE.WebGLRenderer({ antialias: true });
  //     renderer.setClearColor(0x000000);
  //     renderer.setSize(WIDTH, HEIGHT);
  //     renderer.shadowMapEnabled = true;
  //     renderer.shadowMapSoft = true;
  //
  //     // add controls
  //     controls = new THREE.OrbitControls(camera, renderer.domElement);
  //     controls.addEventListener("change", render);
  //
  //     grid = new THREE.GridHelper(50, 5);
  //     color = new THREE.Color("rgb(255,0,0)");
  //     grid.setColors(color, 0x000000);
  //
  //
  //   }
  //
  //   // 3D rendering
  //   const container = document.getElementById("container");
  //
  //
  //   scene.add(camera);
  //   container.appendChild(renderer.domElement);
  //
  //   // const listener = new THREE.AudioListener();
  //
  //   const RADIUS = 50;
  //   const SEGMENTS = 16;
  //   const RINGS = 16;
  //
  //   const sphereMaterial = new THREE.MeshLambertMaterial(
  //     { color: 0xCC0000 });
  //
  //   const sphere = new THREE.Mesh(
  //     new THREE.SphereGeometry(
  //       RADIUS, SEGMENTS, RINGS
  //     ), sphereMaterial);
  //
  //   camera.position.z = 500;
  //   scene.add(sphere);
  //
  //   const pointLight = new THREE.PointLight(0xFFFFFF);
  //   pointLight.position.x = 10;
  //   pointLight.position.y = 50;
  //   pointLight.position.z = 130;
  //   scene.add(pointLight);
  //
  //   function animate() {
  //     renderer.render(scene, camera);
  //     requestAnimationFrame(animate);
  //   }
  //
  //   requestAnimationFrame(animate);
});

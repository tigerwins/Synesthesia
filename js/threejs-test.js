document.addEventListener("DOMContentLoaded", () => {

  // modal controls
  const question = document.getElementById("question");
  const enter = document.getElementById("enter");
  const modal = document.querySelector(".landing-page");

  enter.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  question.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  // Sample music selection
  const visualizer = new Visualizer();
  visualizer.init();

  document.querySelector(".instrumental").onclick = () => {
    // const audio = new Audio("music/instrumental-4.mp3");
    visualizer.loadAndPlaySample("music/instrumental-4.mp3");
  };
  document.querySelector(".chaoz").onclick = () => {
    // const audio = new Audio("music/chaoz-fantasy.mp3");
    visualizer.loadAndPlaySample("music/chaoz-fantasy.mp3");
  };
  document.querySelector(".baba-yetu").onclick = () => {
    // const audio = new Audio("music/chaoz-fantasy.mp3");
    visualizer.loadAndPlaySample("music/baba-yetu.mp3");
  };
  document.querySelector(".swan-lake").onclick = () => {
    // const audio = new Audio("music/scene.mp3");
    visualizer.loadAndPlaySample("music/scene.mp3");
  };

  document.querySelector(".fa-play").onclick = () => {
    if (visualizer.source) {
      visualizer.resume();
    }
  };

  document.querySelector(".fa-pause").onclick = () => {
    if (visualizer.source) {
      visualizer.pause();
    }
  };

  document.querySelector(".fa-stop").onclick = () => {
    if (visualizer.source) {
      visualizer.stop();
    }
  };

  // visualizer selection
  let display;
  document.querySelector(".bars").onclick = () => {
    display = "bars";
  };
  document.querySelector(".rings").onclick = () => {
    display = "rings";
  };
  document.querySelector(".fountain").onclick = () => {
    display = "fountain";
  };





  requestAnimationFrame(visualizer.animate);
});

class Visualizer {
  constructor() {
    // Web Audio API variables
    this.audioContext;
    this.source;
    this.currentFile;
    this.playbackText;
    this.container = document.getElementById("container");


    // three.js setup
    this.scene;
    this.renderer;
    this.camera;
    this.display;
    // this.OrbitControls;

    // rendering variables
    this.animate = this.animate.bind(this);
    this.particleSystem;
    this.particleCount;
    this.pMaterial;
    this.particles;
    this.animation;
  }


  init() {
    window.requestAnimationFrame =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame;
    window.cancelAnimationFrame =
      window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame;
    // window.AudioContext =
      // window.AudioContext ||
      // window.webkitAudioContext;

    // create new audio context for app
    // this.audioContext = new window.AudioContext();
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    this.setupRendering();
  }

  loadAndPlaySample(url) {
    const request = new XMLHttpRequest();
    // current readyState "UNSENT"
    this.currentFile = url.slice(6);
    console.log(this.currentFile);

    // opens an HTTP request, readyState "OPENED"
    request.open("GET", url);

    // audio data will be returned as an ArrayBuffer object
    request.responseType = "arraybuffer";

    // buffer with audio data plays when request successfully finishes
    request.onload = () => {
      // readyState "DONE"
      this.play(request.response);
    };

    // returns as soon as request is sent (asynchronous)
    // readyState "HEADERS_RECEIVED"
    request.send();

    // request proceeds to download, readyState "LOADING"
  }

  play(audio) {
    this.audioContext.decodeAudioData(audio).then((buffer) => {
      console.log(buffer);
      this.visualize(buffer);
    });
  }

  visualize(buffer) {
    const audioCtx = this.audioContext;
    const analyzer = audioCtx.createAnalyser();
    // analyzer.smoothingTimeConstant = 0.1;
    // analyzer.fftSize = 1024;
    let sourceNode = audioCtx.createBufferSource();

    // connect source to analyzer and
    // analyzer to audio context destination
    sourceNode.connect(analyzer);
    analyzer.connect(audioCtx.destination);
    sourceNode.buffer = buffer;

    // stop previous song if currently playing
    if (this.source) {
      this.source.stop(0);
    }

    this.source = sourceNode;
    sourceNode.start(0);

    if (this.animation) {
      cancelAnimationFrame(this.animation);
    }
  }

  // playback controls
  resume() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
      this.playbackText = "Playing";
    }
  }

  pause() {
    if (this.audioContext && this.audioContext.state === "running") {
      this.audioContext.suspend();
      this.playbackText = "Paused";
    }
  }

  stop() {
    if (this.audioContext) {
      this.source.stop(0);
      this.resume();
    }
  }

  // visualization
  setupRendering() {
    const VIEW_ANGLE = 45;
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;
    const ASPECT = WIDTH / HEIGHT;
    const NEAR = 0.1;
    const FAR = 1000;

    const axes = new THREE.AxisHelper(20); // shows 3D axes in render

    // setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    this.container.appendChild(renderer.domElement);

    //setup camera
    const camera = new THREE.PerspectiveCamera(
      VIEW_ANGLE, ASPECT, NEAR, FAR
    );
    camera.position.set(0, 0, 250);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // setup scene
    const scene = new THREE.Scene();

    // setup BLUE LINES TEST
    // const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    // const geometry = new THREE.Geometry();
    // geometry.vertices.push(new THREE.Vector3(-10, 0, 0));
    // geometry.vertices.push(new THREE.Vector3(0, 10, 0));
    // geometry.vertices.push(new THREE.Vector3(10, 0, 0));
    // // note that the line is not closed
    //
    // const line = new THREE.Line(geometry, material);
    // scene.add(line);
    // let group = new THREE.Group();
    // scene.add(group);
    // group.add(line);


    // setup PARTICLE TEST
    const particleCount = 1800;
    this.particleCount = particleCount;
    const particles = new THREE.Geometry();
    let pMaterial;
    let textureArr = [];

    const loader = new THREE.TextureLoader();
    const texture = loader.load("images/particle.png");

    pMaterial = new THREE.PointsMaterial({
      // color: 0xa8a9f0,
      color: 0xffffff,
      size: 5,
      // adding glowing particle image texture to each particle
      // using additive blending--need transparent to be true
      map: texture,
      blending: THREE.AdditiveBlending,
      transparent: true
    });


    // create individual particles
    for (let i = 0; i < particleCount; i++) {
      let pX = Math.random() * 500 - 250;
      let pY = Math.random() * 500 - 250;
      let pZ = Math.random() * 500 - 250;
      let particle = new THREE.Vector3(pX, pY, pZ);
      particle.velocity = new THREE.Vector3(0, -Math.random() * 0.1, 0);

      // add particle to geometry
      particles.vertices.push(particle);
    }

    this.particles = particles;
    // create particle system
    this.particleSystem = new THREE.Points(
      particles, pMaterial);
    // update particle system to sort particles
    this.particleSystem.sortParticles = true;

    scene.add(this.particleSystem);


    renderer.render(scene, camera);


    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;

    // probably need some switch statement to handle the different types of visualizations
  }

  animate() {
    const { particleSystem, particleCount, particles } = this;
    particleSystem.rotation.y += 0.02;

    let pCount = particleCount;
    // debugger;

    while (pCount--) {
      let particle = particles.vertices[pCount];
      if (particle.y < -200) {
        particle.y = 200;
        particle.velocity.y = 0;
      }

      particle.velocity.y -= Math.random() * 0.01;
      particle.add(particle.velocity);
    }

    // flags to the particle system that we've changed the vertices
    particleSystem.geometry.verticesNeedUpdate = true;

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }






}

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
    visualizer.loadAndPlaySample(visualizer.instrumentalUrl);
  };
  document.querySelector(".chaoz").onclick = () => {
    // const audio = new Audio("music/chaoz-fantasy.mp3");
    visualizer.loadAndPlaySample(visualizer.chaozUrl);
  };
  document.querySelector(".swan-lake").onclick = () => {
    // const audio = new Audio("music/scene.mp3");
    visualizer.loadAndPlaySample(visualizer.sceneUrl);
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
});

class Visualizer {
  constructor() {
    // Web Audio API variables
    this.audioContext;
    this.instrumentalUrl = "music/instrumental-4.mp3";
    this.chaozUrl = "music/chaoz-fantasy.mp3";
    this.sceneUrl = "music/scene.mp3";
    this.source;
    this.currentFile;
    this.playbackText;
    this.container = document.getElementById("container");


    // three.js variables
    this.scene;
    this.renderer;
    this.camera;
    this.display;
    // this.OrbitControls;
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
    this.container.appendChild(renderer);

    //setup camera
    const camera = new THREE.PerspectiveCamera(
      VIEW_ANGLE, ASPECT, NEAR, FAR
    );
    camera.position.set(0, 0, 100);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // setup scene
    const scene = new THREE.Scene();







    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;

    // probably need some switch statement to handle the different types of visualizations

  }






}

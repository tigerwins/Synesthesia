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
  document.querySelector(".swan-lake").onclick = () => {
    // const audio = new Audio("music/scene.mp3");
    visualizer.loadAndPlaySample("music/scene.mp3");
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


    // three.js variables
    this.scene;
    this.renderer;
    this.camera;
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
    window.AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    // create new audio context for app
    this.audioContext = new window.AudioContext();
  }

  loadAndPlaySample(url) {
    // debugger
    const xhr = new XMLHttpRequest();
    this.currentFile = url.slice(6);
    console.log(this.currentFile);

    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";

    xhr.onload = () => {
      // debugger
      this.play(xhr.response);
    };

    xhr.send();
  }

  play(audio) {
    this.audioContext.decodeAudioData(audio, (buffer) => {
      this.visualize(buffer);
    });
  }

  visualize(buffer) {
    // debugger
    const audioCtx = this.audioContext;
    const analyzer = audioCtx.createAnalyser();
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

  setup() {
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

  }



}

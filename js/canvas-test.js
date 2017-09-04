let canvas, ctx;
let audioCtx, analyzer, audio, audioSrc;

document.addEventListener("DOMContentLoaded", () => {
  // Modal open/close

  const question = document.getElementById("question");
  const enter = document.getElementById("enter");
  const modal = document.querySelector(".landing-page");

  enter.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  question.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  // Play sample music

  document.querySelector(".instrumental").onclick = () => {
    audio = new Audio("music/instrumental-4.mp3");
    setupAudio(audio);
  };

  document.querySelector(".chaoz").onclick = () => {
    audio = new Audio("music/chaoz-fantasy.mp3");
    setupAudio(audio);
  };
  document.querySelector(".swan-lake").onclick = () => {
    audio = new Audio("music/scene.mp3");
    setupAudio(audio);
  };

  canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext("2d");


  function setupAudio(audioFile) {
    audio.controls = "true";
    document.body.appendChild(audio);

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyzer = audioCtx.createAnalyser();
    audioSrc = audioCtx.createMediaElementSource(audioFile);
    audioSrc.connect(analyzer);
    audioSrc.connect(audioCtx.destination);
    audioFile.play();
  }

  function resume() {
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function pause() {
    if (audioCtx && audioCtx.state === "running") {
      audioCtx.suspend();
    }
  }
});


/*
  // const audio = document.getElementById("myAudio");

  // const frequencyData = new Uint8Array(analyzer.frequencyBinCount);

  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;
  // const VIEW_ANGLE = 45;
  // const ASPECT = WIDTH / HEIGHT;


  let song, sourceNode;

  const instrumental = document.querySelector(".instrumental");

  function setup() {
    song.addEventListener("canplay", () => {
      debugger
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyzer = audioCtx.createAnalyser();

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
    sourceNode = audioCtx.createMediaElementSource(song);
    sourceNode.connect(analyzer);
    sourceNode.connect(audioCtx.destination);
    debugger
    song.play();
  }


}); */

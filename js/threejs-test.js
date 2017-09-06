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

  document.querySelector(".chaoz").onclick = () => {
    visualizer.loadAndPlaySample("music/chaoz-fantasy.mp3");
  };
  document.querySelector(".endeavours").onclick = () => {
    visualizer.loadAndPlaySample("music/endeavours.mp3");
  };
  document.querySelector(".instrumental").onclick = () => {
    visualizer.loadAndPlaySample("music/instrumental-4.mp3");
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

  const { display } = visualizer;
  document.querySelector(".reset").onclick = () => {
    visualizer.resetLights();
  };
  document.querySelector(".bars").onclick = () => {
    if (display[display.length - 1] !== "bars") {
      visualizer.addBars();
    }
  };
  document.querySelector(".helix").onclick = () => {
    // visualizer.display.push("helix");
  };
  document.querySelector(".fountain").onclick = () => {
    // visualizer.display.push("fountain");
  };

  window.addEventListener("resize", visualizer.onWindowResize);

  visualizer.animate();
});

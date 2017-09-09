import Visualizer from './visualizer';
import $ from 'jquery';

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

  // dropdown menus

  $(".nav-option").mouseover(function() {
    $(this).children("ul").removeClass("closed").addClass("open");
  });

  $(".nav-option").mouseleave(function() {
    $(this).children("ul.menu").removeClass("open").addClass("closed");
  });

  $("ul.menu").click(function() {
    $(this).removeClass("open").addClass("closed");
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
  document.querySelector(".blank").onclick = () => {
    visualizer.renderBlank();
  };
  document.querySelector(".bars").onclick = () => {
    if (display[display.length - 1] !== "bars") {
      visualizer.renderBars();
    }
  };
  document.querySelector(".helix").onclick = () => {
    if (display[display.length - 1] !== "helix") {
      visualizer.renderHelix();
    }
  };
  // document.querySelector(".rings").onclick = () => {
    // visualizer.display.push("fountain");
  // };

  window.addEventListener("resize", visualizer.onWindowResize);

  visualizer.animate();
});

import Visualizer from './visualizer';
import $ from 'jquery';

$(() => {
  // modal controls
  $("#enter").click(() => {
    $(".landing-page").addClass("hidden");
    setTimeout(() => {

    }, 1000);
  });
  $("#question").click(() => {
    $(".landing-page").removeClass("hidden");
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

  $(".chaoz").click(() => {
    visualizer.loadAndPlaySample("music/chaoz-fantasy.mp3");
  });
  $(".endeavours").click(() => {
    visualizer.loadAndPlaySample("music/endeavours.mp3");
  });
  $(".instrumental").click(() => {
    visualizer.loadAndPlaySample("music/instrumental-4.mp3");
  });

  // Music playback controls
  $(".fa-play").click(() => {
    if (visualizer.source) {
      visualizer.resume();
    }
  });

  $(".fa-pause").click(() => {
    if (visualizer.source) {
      visualizer.pause();
    }
  });

  $(".fa-stop").click(() => {
    if (visualizer.source) {
      visualizer.stop();
    }
  });

  // visualizer selection

  const { display } = visualizer;
  $(".reset").click(() => {
    visualizer.resetLights();
  });

  $(".blank").click(() => {
    visualizer.renderBlank();
  });

  $(".bars").click(() => {
    if (display[display.length - 1] !== "bars") {
      visualizer.renderBars();
    }
  });

  // $(".rings").click(() => {
  // visualizer.display.push("fountain");
  // });

  $(".helix").click(() => {
    if (display[display.length - 1] !== "helix") {
      visualizer.renderHelix();
    }
  });

  $(window).resize(visualizer.onWindowResize);

  visualizer.animate();
});

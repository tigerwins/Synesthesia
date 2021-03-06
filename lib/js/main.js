import Visualizer from './visualizer';
import $ from 'jquery';

$(() => {
  // Modal controls
  $("#enter").click(() => $(".landing-page").addClass("hidden"));
  $("#question").click(() => $(".landing-page").removeClass("hidden"));

  // Dropdown menus

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

  $(".endeavours").click(() => {
    visualizer.playSample("./assets/music/endeavours.mp3");
  });
  $(".chaoz").click(() => {
    visualizer.playSample("./assets/music/chaoz-fantasy.mp3");
  });
  $(".instrumental").click(() => {
    visualizer.playSample("./assets/music/instrumental-4.mp3");
  });

  // Music playback controls
  $(".audio-btn").click((e) => {
    if (visualizer.audioProcessor.source) {
      $(".audio-btn").removeClass("null");
      $(e.currentTarget).addClass("null");
    }
  });

  $(".fa-play").click(() => {
    if (visualizer.audioProcessor.source) {
      visualizer.resume();
      $(this).addClass("null");
    }
  });

  $(".fa-pause").click(() => {
    if (visualizer.audioProcessor.source) {
      visualizer.pause();
      $(this).addClass("null");
    }
  });

  $(".fa-stop").click(() => {
    if (visualizer.audioProcessor.source) {
      visualizer.stop();
      $(this).addClass("null");
    }
  });

  // Camera controls

  $(".camera-btn").click(() => {
    visualizer.toggleCameraTween();
  });

  $(".animate-camera").click(function() {
    $(this).addClass("hidden");
    $(".still-camera").removeClass("hidden");
  });

  $(".still-camera").click(function() {
    $(this).addClass("hidden");
    $(".animate-camera").removeClass("hidden");
  });

  // Visualizer selection

  const { display } = visualizer;
  $(".reset").click(() => {
    visualizer.resetLights();
  });

  $(".blank").click(() => {
    if (display[display.length - 1] !== "blank") {
      visualizer.renderBlank();
    }
  });

  $(".bars").click(() => {
    if (display[display.length - 1] !== "bars") {
      visualizer.renderBars();
    }
  });

  // $(".rings").click(() => {
  // visualizer.display.push("rings");
  // });

  $(".helix").click(() => {
    if (display[display.length - 1] !== "helix") {
      visualizer.renderHelix();
    }
  });

  $(window).resize(visualizer.onWindowResize);
  visualizer.animate();
});

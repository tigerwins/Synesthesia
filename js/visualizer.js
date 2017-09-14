import * as THREE from 'three';
import TweenMax from 'gsap';
import * as Util from './util';
import resampler from 'audio-resampler';
import $ from 'jquery';

class Visualizer {
  constructor() {
    // Web Audio API variables
    this.inputAudioCtx;
    this.offlineCtx;
    this.outputAudioCtx;
    this.source;
    this.currentFile;
    this.loading = false;
    this.trackStatus = document.querySelector(".track-status");
    this.trackTitle = document.querySelector(".track-title");
    this.container = document.getElementById("container");

    // three.js variables
    this.scene;
    this.renderer;
    this.camera;
    this.display = [];
    this.animation;
    this.cameraTween;

    // rendering variables
    this.particleSystem;
    this.particleCount = 1800;
    this.pMaterial;
    this.particles;

    // bar animation variables
    this.numBars = 57;
    this.toggleCameraMove = true;
    this.barCameraCheck = true;

    // helix animation variables
    this.spiral;
    this.spiral2;
    this.helixGroup;
    this.hueChangeSpeed = 0.0001;
    this.helixCheck = true;

    this.onWindowResize = this.onWindowResize.bind(this);
    this.animate = this.animate.bind(this);
  }

  init() {
    window.requestAnimationFrame =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame;
    window.cancelAnimationFrame =
      window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame;

    this.inputAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // this.analyzer = this.inputAudioCtx.createAnalyser();
    // this.analyzer.fftSize = 2048;

    this.setupRendering();
    this.handleUpload();
  }

  loadAndPlaySample(url) {
    const request = new XMLHttpRequest();
    this.currentFile = url.slice(6);
    request.open("GET", url);
    request.responseType = "arraybuffer";

    request.onload = () => {
      this.play(request.response);
    };

    this.trackStatus.textContent = "Loading audio...";
    request.send();
  }

  handleUpload() {
    const upload = document.getElementById("upload");

    upload.onchange = () => {
      this.trackStatus.textContent = "Loading audio...";
      this.trackTitle.textContent = "";
      if (upload.files.length > 0) {
        this.readAudioFile(upload.files[0]);
      }
    };
  }

  readAudioFile(audioFile) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.currentFile = audioFile.name;
      this.play(e.target.result);
    };

    fileReader.readAsArrayBuffer(audioFile);
  }

  play(audioData) {
    this.inputAudioCtx.decodeAudioData(audioData).then((buffer) => {
      window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      this.offlineCtx = new OfflineAudioContext(2, 44100 * buffer.duration, 44100);

      const sourceNode = this.offlineCtx.createBufferSource();
      sourceNode.buffer = buffer;
      sourceNode.connect(this.offlineCtx.destination);
      sourceNode.start();

      const self = this;
      // resample to 44100 Hz using an offline audio context
      // otherwise the visualizations will be thrown off
      this.offlineCtx.startRendering().then((renderedBuffer) => {
        this.outputAudioCtx = this.outputAudioCtx || new (window.AudioContext || window.webkitAudioContext)();

        this.analyzer =
          this.analyzer || this.outputAudioCtx.createAnalyser();

        const track = this.outputAudioCtx.createBufferSource();
        track.buffer = renderedBuffer;
        track.connect(this.analyzer);
        this.analyzer.connect(this.outputAudioCtx.destination);

        if (self.source) {
          self.source.disconnect();
        }

        self.trackTitle.textContent = self.currentFile;
        self.trackStatus.textContent = "Playing";
        self.source = track;
        self.source.start();

        self.source.onended = () => {
          self.source.disconnect();
          self.source = null;
          self.currentFile = null;
          self.trackStatus.textContent = "";
          self.trackTitle.textContent = "";

          $(".audio-btn").each(function() {
            $(this).addClass("null");
          });
        };
      });

      $(".audio-btn").each(function () {
        $(this).removeClass("null");
      });

      $(".fa-play").addClass("selected");
    });
  }

  resume() {
    if (this.outputAudioCtx && this.outputAudioCtx.state === "suspended") {
      $(".fa-play").addClass("selected");
      this.outputAudioCtx.resume();
      this.trackStatus.textContent = "Playing";
      if (this.cameraTween) {
        this.cameraTween.resume();
      }
      this.animation = requestAnimationFrame(this.animate);
    }
  }

  pause() {
    if (this.outputAudioCtx && this.outputAudioCtx.state === "running") {
      $(".fa-pause").addClass("selected");
      this.outputAudioCtx.suspend();
      this.trackStatus.textContent = "Paused";
      if (this.cameraTween) {
        this.cameraTween.pause();
      }
      cancelAnimationFrame(this.animation);
    }
  }

  stop() {
    if (this.outputAudioCtx) {
      this.source.stop(0);

      // setTimeout(() => {
      //   this.source.disconnect();
      //   this.source = null;
      // }, 500);

      // setTimeout(() => {
      //   this.source = null;
      // }, 2000);

      this.resume();
      // this.trackStatus.textContent = "";
      // this.trackTitle.textContent = "";
      // this.currentFile = null;
    }
  }

  setupRendering() {
    const VIEW_ANGLE = 45;
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;
    const ASPECT = WIDTH / HEIGHT;
    const NEAR = 0.1;
    const FAR = 1000;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    this.container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      VIEW_ANGLE, ASPECT, NEAR, FAR
    );

    camera.position.set(0, 0, 150);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const scene = new THREE.Scene();
    renderer.render(scene, camera);

    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    this.renderLights();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  renderBlank() {
    this.display.push("blank");
    if (this.cameraTween) {
      this.cameraTween.kill();
    }

    this.cameraTween = TweenMax.to(this.camera.position, 2, { x: 0, y: 0, z: 150 });
  }

  animateBlank() {
    this.renderer.render(this.scene, this.camera);
  }

  renderLights() {
    this.display.push("lights");

    this.particleCount = 1800;
    const particles = new THREE.Geometry();
    const loader = new THREE.TextureLoader();
    const texture = loader.load("textures/particle.png");

    const pMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 5,
      map: texture,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    for (let i = 0; i < this.particleCount; i++) {
      let pX = Math.random() * 400 - 200;
      let pY = Math.random() * 150 + 150;
      let pZ = Math.random() * 300 - 150;
      let particle = new THREE.Vector3(pX, pY, pZ);
      particle.velocity = new THREE.Vector3(0, -Math.random() * 1.5, 0);

      particles.vertices.push(particle);
    }

    this.particles = particles;
    this.particleSystem = new THREE.Points(particles, pMaterial);
    this.particleSystem.sortParticles = true;
    this.scene.add(this.particleSystem);
  }

  resetLights() {
    const { particleSystem, particleCount, particles, display } = this;

    if (!display.includes("lights")) {
      this.display.push("lights");
    }

    particleSystem.material.opacity = 1;
    for (let i = 0; i < particleCount; i++) {
      let particle = particles.vertices[i];
      let pX = Math.random() * 400 - 200;
      let pY = Math.random() * 150 + 150;
      let pZ = Math.random() * 300 - 150;
      particle = new THREE.Vector3(pX, pY, pZ);
      particle.velocity = new THREE.Vector3(0, -Math.random() * 1.5, 0);
      particle.add(particle.velocity);
      particles.vertices[i] = particle;
    }

    this.cameraTween = TweenMax.to(this.camera.position, 2, { x: 0, y: 0, z: 150 });
  }

  animate() {
    const { display } = this;
    this.camera.lookAt(new THREE.Vector3(0,0,0));

    if (display.includes("lights")) {
      this.animateLights();
    }
    if (display.includes("bars")) {
      this.animateBars();

      if (display[display.length - 1] === "bars") {
        this.animateBarsCamera();
      }
    }
    if (display.includes("helix")) {
      this.animateHelix();
    }
    if (display.includes("blank")) {
      this.animateBlank();
    }

    this.animation = requestAnimationFrame(this.animate);
  }

  animateLights() {
    const { particleSystem, particleCount, particles, display, renderer } = this;

    particleSystem.rotation.y += 0.02;

    for (let i = 0; i < particleCount; i++) {
      let particle = particles.vertices[i];
      if (display[display.length - 1] !== "lights") {
        particle.velocity.y -= Math.random() * 0.1;
        particleSystem.material.opacity -= 0.000001;
      } else if (display.includes("lights") && particle.y < -100) {
        particle.y = 150;
        particle.velocity.y = -Math.random() * 0.5;
      }

      particle.velocity.y -= Math.random() * 0.01;
      particle.add(particle.velocity);
    }

    particleSystem.geometry.verticesNeedUpdate = true;
    renderer.render(this.scene, this.camera);

    if (particles.vertices.every((particle) => {
      return particle.y < -150;
    })) {
      particleSystem.material.opacity = 0;
      const lightsIdx = display.indexOf("lights");
      display.splice(lightsIdx, 1);
    }
  }

  renderBars() {
    this.barCameraCheck = true;
    this.display.push("bars");
    const { scene, camera, renderer} = this;
    renderer.shadowMap.enabled = true;

    const pos0 = new THREE.Vector3(0, 0, 150);
    if (!camera.position.equals(pos0)) {
      this.cameraTween = TweenMax.to(camera.position, 5,
        { ease: Sine.easeInOut, x: 0, y: 0, z: 150 });
    }

    const barGroup = new THREE.Group();
    barGroup.name = "bars";

    const pointLight = new THREE.PointLight(0x00D4FF, 5, 400, 2);
    pointLight.position.set(0, 50, 0);
    barGroup.add(pointLight);

    // Setup plane for bars to stand on
    const planeGeometry = new THREE.PlaneGeometry(500, 500);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0x222222,
      specular: 0xdddddd,
      shininess: 5,
      reflectivity: 2
    });

    planeMaterial.side = THREE.DoubleSide;
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;
    plane.receiveShadow = true;
    barGroup.add(plane);

    const cubeGeometry = new THREE.BoxGeometry(2, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0x00D4FF,
      specular: 0x01FF00,
      shininess: 10,
      reflectivity: 2.5
    });
    let barMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);

    for (let i = 0; i < this.numBars; i++) {
      let bar = barMesh.clone();
      bar.material.opacity = 1;
      bar.material.transparent = true;

      bar.position.x = 40 * Math.sin(i * 2 * Math.PI / this.numBars);
      bar.position.y = 0;
      bar.position.z = 40 * Math.cos(i * 2 * Math.PI / this.numBars);
      bar.castShadow = true;
      bar.name = "bar" + i;
      barGroup.add(bar);
    }

    scene.add(barGroup);
  }

  animateBars() {
    const { scene, renderer, camera, tween, analyzer, numBars, display } = this;
    TweenMax.lagSmoothing(33, 33);

    if (this.source) {
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzer.getByteFrequencyData(dataArray);

      const freqInterval = Math.round(dataArray.length * 3 / 4 / (numBars + 3));
      for (let i = 0; i < numBars; i++) {
        let value = dataArray[i * freqInterval];
        value = value < 1 ? 1 : value; // it gets mad if value < 1
        let bar = scene.getObjectByName("bar" + i);
        bar.scale.y = value;
      }
    }

    renderer.render(scene, camera);

    if (display[display.length - 1] !== "bars") {
      const barIdx = display.indexOf("bars");
      this.display.splice(barIdx, 1);

      const barGroup = scene.getObjectByName("bars");
      scene.remove(barGroup);
    }
  }

  animateBarsCamera() {
    const { camera, toggleCameraMove } = this;
    const pos0 = new THREE.Vector3(0, 0, 150);
    const pos1 = new THREE.Vector3(0, 250, 200);
    const pos2 = new THREE.Vector3(150, 50, -100);
    const pos3 = new THREE.Vector3(-75, 250, -50);
    const pos4 = new THREE.Vector3(0, 50, 250);
    const pos5 = new THREE.Vector3(150, 250, -75);
    const pos6 = new THREE.Vector3(-150, 50, -100);

    if (toggleCameraMove) {
      if (camera.position.equals(pos0)) {
        if (this.source && this.barCameraCheck) {
          setTimeout(() => {
            this.cameraTween = TweenMax.to(camera.position, 5,
              { ease: Sine.easeInOut, x: 0, y: 250, z: 200 });
          }, 7000);
          this.barCameraCheck = false;
        }
      } else if (camera.position.equals(pos1)) {
        this.cameraTween = TweenMax.to(camera.position, 10,
          { ease: Sine.easeInOut, x: 150, y: 50, z: -100 });
      } else if (camera.position.equals(pos2)) {
        this.cameraTween = TweenMax.to(camera.position, 10,
          { ease: Sine.easeInOut, x: -75, y: 250, z: -50 });
      } else if (camera.position.equals(pos3)) {
        this.cameraTween = TweenMax.to(camera.position, 10,
            { ease: Sine.easeInOut, x: 0, y: 50, z: 250 });
      } else if (camera.position.equals(pos4)) {
        this.cameraTween = TweenMax.to(camera.position, 10,
          { ease: Sine.easeInOut, x: 150, y: 250, z: -75 });
      } else if (camera.position.equals(pos5)) {
        this.cameraTween = TweenMax.to(camera.position, 10,
          { ease: Sine.easeInOut, x: -150, y: 50, z: -100 });
      } else if (camera.position.equals(pos6)) {
        this.cameraTween = TweenMax.to(camera.position, 10,
          { ease: Sine.easeInOut, x: 0, y: 250, z: 200});
      }
    } else {
      this.cameraTween = TweenMax.to(camera.position, 4, { east: Sine.easeInOut, x: 0, y: 250, z: 200 });
    }
  }

  renderHelix() {
    this.helixCheck = true;
    this.display.push("helix");
    const { camera, scene, renderer, display } = this;

    const helixGroup = new THREE.Group();
    helixGroup.name = "helix";

    function SinCurve(scale) {
      THREE.Curve.call(this);
      this.scale = (scale === undefined) ? 1 : scale;
    }

    SinCurve.prototype = Object.create(THREE.Curve.prototype);
    SinCurve.prototype.constructor = SinCurve;

    SinCurve.prototype.getPoint = function (t) {
      const tx = t * 40 - 20;
      const ty = Math.sin(2*Math.PI * t * 10);
      const tz = Math.cos(2*Math.PI * t * 10);
      return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
    };

    function CosCurve(scale) {
      THREE.Curve.call(this);
      this.scale = (scale === undefined) ? 1 : scale;
    }

    CosCurve.prototype = Object.create(THREE.Curve.prototype);
    CosCurve.prototype.constructor = CosCurve;

    CosCurve.prototype.getPoint = function (t) {
      const tx = t * 40 - 20 - 3/5*Math.PI;
      const ty = Math.sin(2*Math.PI * t * 10);
      const tz = Math.cos(2*Math.PI * t * 10);
      return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
    };

    const path1 = new SinCurve(50);
    const path2 = new CosCurve(50);

    const geometry1 = new THREE.TubeGeometry(
      path1, 500, 20, 50, false);
    const geometry2 = new THREE.TubeGeometry(
      path2, 500, 20, 50, false);

    const colors1 = [];
    const colors2 = [];
    const numVertices = geometry1.vertices.length;

    for (let i = 0; i < numVertices; i++) {
      colors1[i] = new THREE.Color();
      colors2[i] = new THREE.Color();
      colors1[i].setHSL(i / 100000, 1, 0.5);
      colors2[i].setHSL(0.5 + i / 100000, 1, 0.5);
    }

    // trippy rainbow
    // for (let i = 0; i < numVertices; i++) {
    //   colors1[i] = new THREE.Color();
    //   colors2[i] = new THREE.Color();
    //   colors1[i].setHSL(i / 1000000 * 360, 1, 0.5);
    //   colors2[i].setHSL(i / 1000000 * 360, 1, 0.5);
    // }

    geometry1.colors = colors1;
    geometry2.colors = colors2;

    const material1 = new THREE.PointsMaterial({
      size: 5,
      opacity: 0.7,
      vertexColors: THREE.VertexColors

    });
    const material2 = new THREE.PointsMaterial({
      size: 5,
      opacity: 0.7,
      vertexColors: THREE.VertexColors
    });

    const spiral1 = new THREE.Points(geometry1, material1);
    const spiral2 = new THREE.Points(geometry2, material2);

    this.spiral1 = spiral1;
    this.spiral2 = spiral2;
    helixGroup.add(this.spiral1);
    helixGroup.add(this.spiral2);
    this.helixGroup = helixGroup;

    scene.add(this.helixGroup);

    this.cameraTween = TweenMax.to(camera.position, 2, { x: 0, y: 0, z: 500 });
  }

  animateHelix() {
    TweenMax.lagSmoothing(33, 33);
    const { display, camera, renderer, analyzer } = this;
    const { spiral1, spiral2, hueChangeSpeed } = this;

    if (!this.source) {
      this.spiral1.rotation.x += 0.001;
      this.spiral2.rotation.x += 0.001;
    } else {
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzer.getByteFrequencyData(dataArray);
      const highBeatRange =
        dataArray.slice(0, Math.round(dataArray.length * 1/3));
      const highDataSum = highBeatRange.reduce((sum, value) => {
        return sum + Math.pow(value, 2);
      }, 0);
      const rmsVolumeHigh = 1 + Math.ceil(Math.sqrt(highDataSum/dataArray.length));

      const lowBeatRange =
        dataArray.slice(Math.round(dataArray.length * 2/3));
      const lowDataSum = lowBeatRange.reduce((sum, value) => {
        return sum + Math.pow(value, 2);
      }, 0);
      const rmsVolumeLow = 1 + Math.ceil(Math.sqrt(lowDataSum/dataArray.length));

      this.spiral1.rotation.x += (0.1 * rmsVolumeLow / 11);
      this.spiral2.rotation.x += (0.1 * rmsVolumeLow / 11);

      const numVertices = this.spiral1.geometry.vertices.length;
      for (let i = 0; i < numVertices; i++) {
        const color1 = this.spiral1.geometry.colors[i].getHSL();
        const color2 = this.spiral2.geometry.colors[i].getHSL();
        this.spiral1.geometry.colors[i].setHSL(color1.h + hueChangeSpeed * rmsVolumeHigh, 1, 0.5);
        this.spiral2.geometry.colors[i].setHSL(color2.h + hueChangeSpeed * rmsVolumeHigh, 1, 0.5);
      }
    }

    this.spiral1.geometry.verticesNeedUpdate = true;
    this.spiral2.geometry.verticesNeedUpdate = true;
    this.spiral1.geometry.colorsNeedUpdate = true;
    this.spiral2.geometry.colorsNeedUpdate = true;
    renderer.render(this.scene, this.camera);

    if (display[display.length - 1] !== "helix") {
      this.removeHelix();
    }
  }

  removeHelix() {
    const { helixGroup, helixCheck } = this;

    if (helixCheck) {
      this.cameraTween = TweenMax.to(helixGroup.position, 3, { ease: Sine.easeInOut, x: 4000, y: 0, z: 0 });
      this.helixCheck = false;
    }

    if (helixGroup.position.equals(new THREE.Vector3(4000,0,0))) {
      const helixIdx = this.display.indexOf("helix");
      this.display.splice(helixIdx, 1);
      this.scene.remove(helixGroup);
    }
  }
}

export default Visualizer;

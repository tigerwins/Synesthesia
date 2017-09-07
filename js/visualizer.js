import * as Util from './util';
import * as THREE from './three.js';

class Visualizer {
  constructor() {
    // Web Audio API variables
    this.audioContext;
    this.source;
    this.leftSource;
    this.rightSource;
    this.currentFile;
    this.playbackText;
    this.container = document.getElementById("container");

    // three.js setup
    this.scene;
    this.renderer;
    this.camera;
    this.display = [];

    // rendering variables
    this.particleSystem;
    this.particleCount = 1800;
    this.pMaterial;
    this.particles;
    this.animation;
    this.tween;

    // bar animation variables
    this.numBars = 57;

    // helix animation variables
    this.helixScale;
    this.spiral;
    this.spiral2;

    // method binding
    this.onWindowResize = this.onWindowResize.bind(this);
    this.animate = this.animate.bind(this);
    this.animateLights = this.animateLights.bind(this);
    this.animateBars = this.animateBars.bind(this);
    this.animateHelix = this.animateHelix.bind(this);
  }


  init() {
    window.requestAnimationFrame =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame;
    window.cancelAnimationFrame =
      window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame;

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyzer = this.audioContext.createAnalyser();
    // analyzer.fftSize = 2048;

    this.setupRendering();
  }

  loadAndPlaySample(url) {
    const request = new XMLHttpRequest();
    // current readyState "UNSENT"
    this.currentFile = url.slice(6);
    // console.log(this.currentFile);

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
      // console.log(buffer);
      // const numChannels = 2;
      // const frameCount = this.audioContext.sampleRate * 2;
      // const myArrayBuffer = this.audioContext.createBuffer(
      //
      // );
      this.leftSource = buffer.getChannelData(0);
      this.rightSource = buffer.getChannelData(1);

      let sourceNode = this.audioContext.createBufferSource();

      // connect source to analyzer and
      // analyzer to audio context destination
      sourceNode.buffer = buffer;
      sourceNode.connect(this.analyzer);
      this.analyzer.connect(this.audioContext.destination);

      // stop previous song if currently playing
      if (this.source) {
        this.source.stop(0);
      }

      this.source = sourceNode;
      this.source.start(0);

      // if (this.animation) {
      //   cancelAnimationFrame(this.animation);
      // }
    });
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
      this.source = null;
      this.resume();
    }
  }

  // setup camera, scene, renderer
  setupRendering() {
    const VIEW_ANGLE = 45;
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;
    const ASPECT = WIDTH / HEIGHT;
    const NEAR = 0.1;
    const FAR = 1000;

    // const axes = new THREE.AxisHelper(20);

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
  }

  renderLights() {
    this.display.push("lights");
    this.particleCount = 1800;
    // const particles = new THREE.Geometry();
    const particles = new THREE.Geometry();

    const loader = new THREE.TextureLoader();
    const texture = loader.load("textures/particle.png");

    const pMaterial = new THREE.PointsMaterial({
      // color: 0xa8a9f0,
      color: 0xffffff,
      size: 5,
      // adding glowing particle image texture to each particle
      // additive blending needs transparent to be true
      map: texture,
      blending: THREE.AdditiveBlending,
      transparent: true
    });


    // create individual particles
    for (let i = 0; i < this.particleCount; i++) {
      let pX = Math.random() * 400 - 200;
      let pY = Math.random() * 150 + 150;
      let pZ = Math.random() * 300 - 150;
      let particle = new THREE.Vector3(pX, pY, pZ);
      particle.velocity = new THREE.Vector3(0, -Math.random() * 1.5, 0);

      // add particle to geometry
      particles.vertices.push(particle);
    }

    this.particles = particles;
    // create particle system
    this.particleSystem = new THREE.Points(
      particles, pMaterial);
    this.particleSystem.sortParticles = true;

    this.scene.add(this.particleSystem);

    // test lighting

    // const ambientLight = new THREE.AmbientLight(0x0c0c0c);
    // scene.add(ambientLight);
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    // directionalLight.castShadow = true;
    // directionalLight.position.set(0, 50, 50);
    // scene.add(directionalLight);
  }

  resetLights() {
    const { particleSystem, particleCount, particles, display } = this;

    if (display[display.length - 1] !== "lights") {
      this.display.push("lights");
    }

    // reset particles (positions and alphas)
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

    if (!display.includes("lights") || (display.length === 1 && display[0] === "lights")) {
      requestAnimationFrame(this.animate);
    }
  }

  animate() {
    const { display } = this;
    if (display.includes("lights")) {
      this.animateLights();
    }
    if (display.includes("bars")) {
      this.animateBars();
    }
    if (display.includes("helix")) {
      this.animateHelix();
    }
  }

  animateLights() {
    const { particleSystem, particleCount, particles, display, renderer } = this;

    particleSystem.rotation.y += 0.02;

    for (let i = 0; i < particleCount; i++) {
      let particle = particles.vertices[i];
      if (display[display.length - 1] !== "lights") {
        // speeds up and fades out lights when visualization changes
        particle.velocity.y -= Math.random() * 0.1;
        particleSystem.material.opacity -= 0.000001;
      } else if (display.includes("lights") && particle.y < -100) {
        particle.y = 150;
        particle.velocity.y = -Math.random() * 0.5;
      }

      particle.velocity.y -= Math.random() * 0.01;
      particle.add(particle.velocity);
    }

    // flags to the particle system that we've changed the vertices
    particleSystem.geometry.verticesNeedUpdate = true;
    renderer.render(this.scene, this.camera);

    // sets particle to hidden after they pass below a threshold
    if (particles.vertices.every((particle) => {
      return particle.y < -150;
    })) {
      particleSystem.material.opacity = 0;
      const lightsIdx = display.indexOf("lights");
      display.splice(lightsIdx, 1);
    }

    if (display[display.length - 1] === "lights") {
      requestAnimationFrame(this.animate);
    }
  }

  renderBars() {
    this.display.push("bars");
    const { scene, camera, renderer} = this;
    renderer.shadowMap.enabled = true;

    const barGroup = new THREE.Group();
    barGroup.name = "bars";

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

    // setup bars
    const cubeGeometry = new THREE.BoxGeometry(2, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0x00D4FF,
      specular: 0x01FF00,
      shininess: 20,
      reflectivity: 5.5
    });

    for (let i = 0; i < this.numBars; i++) {
      let bar = new THREE.Mesh(cubeGeometry, cubeMaterial);
      bar.material.opacity = 1;
      bar.material.transparent = true;

      // Trig functions take radians
      bar.position.x = 40 * Math.sin(i * 2 * Math.PI / this.numBars);
      bar.position.y = 0;
      bar.position.z = 40 * Math.cos(i * 2 * Math.PI / this.numBars);
      bar.castShadow = true; // might not be necessary for now
      bar.name = "bar" + i;
      barGroup.add(bar);
    }

    // const position = {
    //   x: camera.position.x,
    //   y: camera.position.y,
    //   z: camera.position.z
    // };
    // const target = { x: 0, y: 45, z: 150 };
    // const tween = new TWEEN.Tween(position)
    //   .to(target, 2000)
    //   .easing(TWEEN.Easing.Linear.None)
    //   .onUpdate(function() {
    //     camera.position.set(this.x, this.y, this.z);
    //     camera.lookAt(new THREE.Vector3(0, -40, 0));
    //   })
    //   .onComplete(function() {
    //     camera.lookAt(new THREE.Vector3(0, -40, 0));
    //   })
    //   .start();
    //
    // this.tween = tween;

    // camera.position.set(0, 45, 150);
    // camera.lookAt(new THREE.Vector3(0, -40, 0));
    // tween.onUpdate(() => {
    //   camera.position.y = position.y;
    // });
    // tween.start();

    camera.position.set(0, 150, 150);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const pointLight = new THREE.PointLight(0x00D4FF, 5, 400, 2);
    pointLight.position.set(0, 50, 0);
    barGroup.add(pointLight);
    scene.add(barGroup);
  }

  animateBars() {
    const { scene, renderer, camera, tween, analyzer, numBars, display } = this;
    let allBars = [];

    // TWEEN.update();

    if (this.source) {
      // retrieve data from the frequency data from analyzer
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzer.getByteFrequencyData(dataArray);

      // change bar height
      const freqInterval = Math.round(dataArray.length * 3 / 4 / (numBars + 3));
      for (let i = 0; i < numBars; i++) {
        let value = dataArray[i * freqInterval];
        value = value < 1 ? 1 : value; // it gets mad if value < 1
        let bar = scene.getObjectByName("bar" + i);
        bar.scale.y = value;

        if (display[display.length - 1] !== "bars") {
          bar.material.opacity -= 0.000001;
          allBars.push(bar);
        }
      }
    }

    renderer.render(scene, camera);
    if (display[display.length - 1] === "bars") {
      requestAnimationFrame(this.animate);
    // } else if (allBars.every(bar => {
      // return bar.material.opacity <= 0;
    // })) {
    } else {
      const barIdx = display.indexOf("bars");
      this.display.splice(barIdx, 1);

      const barGroup = scene.getObjectByName("bars");
      scene.remove(barGroup);
      if (display[display.length - 1] === "lights") {
        // camera.position.set(0, 0, 150);
        // camera.lookAt(new THREE.Vector3(0, 0, 0));
      }
    }
  }

  renderHelix() {
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
    }

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
    }

    const path1 = new SinCurve(50);
    const path2 = new CosCurve(50);

    const geometry1 = new THREE.TubeBufferGeometry(
      path1, 500, 20, 50, false);
    const geometry2 = new THREE.TubeBufferGeometry(
      path2, 500, 20, 50, false);
    const numVertices = geometry1.attributes.position.count;
    const alphas = new Float32Array(numVertices * 1);
    for (let i = 0; i < numVertices; i++) {
      alphas[i] = 0.1;
    }

    geometry1.addAttribute(
      "alpha", new THREE.BufferAttribute(alphas, 1));
    geometry2.addAttribute(
      "alpha", new THREE.BufferAttribute(alphas, 1));

    const loader = new THREE.TextureLoader();
    // const texture = loader.load("textures/perlin-512.png");
    const material1 = new THREE.PointsMaterial({
      size: 5,
      color: 0xff0000,
      // map: texture,
      // blending: THREE.AdditiveBlending,
      // transparent: true
    });
    const material2 = new THREE.PointsMaterial({
      size: 5,
      color: 0x00ff00,
      // map: texture,
      // blending: THREE.AdditiveBlending,
      // transparent: true
    });

    const spiral1 = new THREE.Points(geometry1, material1);
    const spiral2 = new THREE.Points(geometry2, material2);
    console.log(spiral1);
    console.log(spiral1.geometry.vertices);

    this.spiral1 = spiral1;
    this.spiral2 = spiral2;
    helixGroup.add(this.spiral1);
    helixGroup.add(this.spiral2);
    scene.add(helixGroup);

    camera.position.set(0, 0, 500);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.animate();
  }

  animateHelix() {
    const { display, camera, renderer, analyzer } = this;
    const { spiral1, spiral2 } = this;

    const numVertices = spiral1.geometry.attributes.position.count;



    // for (let i = 0; i < numVertices; i++) {
    //   alphas[i] = Math.random();
    // }

    if (!this.source) {
      this.spiral1.rotation.x += 0.001;
      this.spiral2.rotation.x += 0.001;
    } else {
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzer.getByteFrequencyData(dataArray);
      const beatRange =
        dataArray.slice(Math.round(dataArray.length * 2/3));
      const dataSum = beatRange.reduce((sum, value) => {
        return sum + value;
      }, 0);

      const rmsVolume = 1 + Math.ceil(Math.sqrt(dataSum/dataArray.length));
      // console.log(rmsVolume);

      this.spiral1.rotation.x += (0.13 * rmsVolume / 11);
      this.spiral2.rotation.x += (0.13 * rmsVolume / 11);

      const freqInterval = Math.round(dataArray.length * 3/4 / (numVertices));

      for (let i = 0; i < numVertices; i++) {
        // this.spiral1.vertices[i].
      }


    }

    this.spiral1.geometry.verticesNeedUpdate = true;
    this.spiral2.geometry.verticesNeedUpdate = true;
    renderer.render(this.scene, this.camera);

    if (display[display.length - 1] === "helix") {
      requestAnimationFrame(this.animate);
    }
  }
}

export default Visualizer;

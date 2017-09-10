import * as THREE from 'three';
import TweenMax from 'gsap';
import * as Util from './util';

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

    // bar animation variables
    this.numBars = 57;
    this.toggleCameraMove = true;
    this.barCheck = true;

    // helix animation variables
    this.helixScale;
    this.spiral;
    this.hue1 = 0;
    this.spiral2;
    this.helixGroup;
    this.hue2 = 180;
    this.hueChangeSpeed = 0.01;
    this.orbitLights;
    this.helixCheck = true;
    this.orbitCheck = true;

    this.orbitCount = 0;

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
    this.handleUpload();
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

  handleUpload() {
    const upload = document.getElementById("upload");

    upload.onchange = () => {
      if (upload.files.length > 0) {
        console.log(upload.files);
        this.readAudioFile(upload.files[0]);
      }
    };
  }

  readAudioFile(audioFile) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      console.log(e);
      this.play(e.target.result);
    };

    fileReader.readAsArrayBuffer(audioFile);
  }

  play(audio) {
    this.audioContext.decodeAudioData(audio).then((buffer) => {
      this.leftSource = buffer.getChannelData(0);
      this.rightSource = buffer.getChannelData(1);
      console.log

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
      setTimeout(() => {
        this.source = null;
      }, 2000);
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
    const particles = new THREE.Geometry();
    const loader = new THREE.TextureLoader();
    const texture = loader.load("textures/particle.png");

    const pMaterial = new THREE.PointsMaterial({
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
  }

  resetLights() {
    const { particleSystem, particleCount, particles, display } = this;

    if (!display.includes("lights")) {
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

    TweenMax.to(this.camera.position, 2, { x: 0, y: 0, z: 150 });
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
        if (this.source && this.barCheck) {
          setTimeout(() => {
            TweenMax.to(camera.position, 5,
              { ease: Sine.easeInOut, x: 0, y: 250, z: 200 });
          }, 7000);
          this.barCheck = false;
        }
      } else if (camera.position.equals(pos1)) {
        TweenMax.to(camera.position, 10,
          { ease: Sine.easeInOut, x: 150, y: 50, z: -100 });
      } else if (camera.position.equals(pos2)) {
        TweenMax.to(camera.position, 10,
          { ease: Sine.easeInOut, x: -75, y: 250, z: -50 });
      } else if (camera.position.equals(pos3)) {
        TweenMax.to(camera.position, 10,
            { ease: Sine.easeInOut, x: 0, y: 50, z: 250 });
      } else if (camera.position.equals(pos4)) {
        TweenMax.to(camera.position, 10,
          { ease: Sine.easeInOut, x: 150, y: 250, z: -75 });
      } else if (camera.position.equals(pos5)) {
        TweenMax.to(camera.position, 10,
          { ease: Sine.easeInOut, x: -150, y: 50, z: -100 });
      } else if (camera.position.equals(pos6)) {
        TweenMax.to(camera.position, 10,
          { ease: Sine.easeInOut, x: 0, y: 250, z: 200});
      }
    } else {
      TweenMax.to(camera.position, 4, { east: Sine.easeInOut, x: 0, y: 250, z: 200 });
    }
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
      // this.camera.lookAt(new THREE.Vector3(0,0,0));
    }

    requestAnimationFrame(this.animate);
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
  }

  renderBars() {
    this.barCheck = true;
    this.display.push("bars");
    const { scene, camera, renderer} = this;
    renderer.shadowMap.enabled = true;

    const pos0 = new THREE.Vector3(0, 0, 150);
    if (!camera.position.equals(pos0)) {
      TweenMax.to(camera.position, 5,
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

    // setup bars
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

      // Trig functions take radians
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
      // colors1[i].setHSL(0, 1, 0.5);
      // colors2[i].setHSL(0.5, 1, 0.5);
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
      // transparent: true,
      opacity: 0.7,
      vertexColors: THREE.VertexColors

    });
    const material2 = new THREE.PointsMaterial({
      size: 5,
      // transparent: true,
      opacity: 0.7,
      vertexColors: THREE.VertexColors
    });

    const spiral1 = new THREE.Points(geometry1, material1);
    const spiral2 = new THREE.Points(geometry2, material2);

    this.spiral1 = spiral1;
    this.spiral2 = spiral2;
    // this.renderOrbitLights();
    helixGroup.add(this.spiral1);
    helixGroup.add(this.spiral2);
    this.helixGroup = helixGroup;

    scene.add(this.helixGroup);

    TweenMax.to(camera.position, 2, { x: 0, y: 0, z: 500 });
  }

  renderOrbitLights() {
    this.orbitCheck = true;
    const numLights = 10;
    const lightGroup = new THREE.Group();
    lightGroup.name = "orbitLights";
    const bulbGeometry = new THREE.SphereGeometry(2, 16, 8);
    const bulbMaterial = new THREE.MeshStandardMaterial({
    	emissive: 0xffffee,
			emissiveIntensity: 1,
			color: 0x000000
		});

    let bulbLight = new THREE.PointLight(0xffee88, 1, 100, 2);
    bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMaterial));

    for (let i = 0; i < numLights; i++) {
      let bulb = bulbLight.clone();
      let x = 300 * Math.random() - 150;
      let y = 2 * (150 - Math.abs(x)) * Math.random() - (150 - Math.abs(x));
      let z = Math.sign(Math.random() - 0.5) *
        Math.sqrt(Math.pow(200, 2) - Math.pow(x, 2) - Math.pow(y, 2));
      bulb.position.set(x, y, z);
      bulb.name = "light" + i;
      bulb.castShadow = true;
      lightGroup.add(bulb);
    }

    this.orbitLights = lightGroup;
    this.scene.add(this.orbitLights);
  }

  animateHelix() {
    TweenMax.lagSmoothing(33, 33);
    const { display, camera, renderer, analyzer } = this;
    const { spiral1, spiral2, hueChangeSpeed } = this;

    // const numVertices = spiral1.geometry.attributes.position.count;

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
        return sum + Math.pow(value, 2);
      }, 0);

      const rmsVolume = 1 + Math.ceil(Math.sqrt(dataSum/dataArray.length));
      // console.log(rmsVolume);

      this.spiral1.rotation.x += (0.1 * rmsVolume / 11);
      this.spiral2.rotation.x += (0.1 * rmsVolume / 11);
      this.hue1 += hueChangeSpeed;
      this.hue2 += hueChangeSpeed;
      this.spiral1.material.color.set("hsl(" + this.hue1 + ", 1, 0.5");
      this.spiral2.material.color.set("hsl(" + this.hue2 + ", 1, 0.5");

    }
    if (this.orbitCheck) {
      // this.animateOrbitLights(dataArray);
    }

    this.spiral1.geometry.verticesNeedUpdate = true;
    this.spiral2.geometry.verticesNeedUpdate = true;
    // console.log(this.spiral1);
    renderer.render(this.scene, this.camera);

    if (display[display.length - 1] !== "helix") {
      this.removeHelix();
      // this.removeOrbitLights();
    }
  }

  animateOrbitLights(dataArray) {
    const { scene, orbitLights } = this;
    const numLights = orbitLights.children.length;

    if (dataArray) {
      const beatRange =
        dataArray.slice(0, Math.round(Number(dataArray.length) * 1/3));
      const dataSum = beatRange.reduce((sum, value) => {
        return sum + Math.pow(value, 2);
      });

      const rmsVolume =
        Math.floor(Math.sqrt(dataSum/dataArray.length))/10;
      const bulb = scene.getObjectByName("light" + this.orbitCount);
      bulb.scale.x = rmsVolume;
      bulb.scale.y = rmsVolume;
      bulb.scale.z = rmsVolume;
      this.orbitCount = (1 + this.orbitCount) % numLights;
    }
  }

  removeHelix() {
    const { helixGroup, helixCheck, orbitLights } = this;

    if (helixCheck) {
      TweenMax.to(helixGroup.position, 3, { ease: Sine.easeInOut, x: 4000, y: 0, z: 0 });
      this.helixCheck = false;
    }

    if (helixGroup.position.equals(new THREE.Vector3(4000,0,0))) {
      const helixIdx = this.display.indexOf("helix");
      this.display.splice(helixIdx, 1);
      this.scene.remove(helixGroup);
      this.scene.remove(orbitLights);
    }
  }

  removeOrbitLights() {
    const { orbitLights, orbitCheck } = this;
    const self = this;

    function setRemoveTimeout() {
      setTimeout(() => {
        self.scene.remove(orbitLights);
      }, 3000);
    }

    if (orbitCheck && orbitLights) {
      orbitLights.children.forEach(light => {
        TweenMax.to(light.position, 3, { ease: Power3.easeIn, x: 0, y: 0, z: 0 });
        TweenMax.to(light.scale, 3, { ease: Power3.easeIn, x: 1, y: 1, z: 1 });
      });

      this.orbitCheck = false;
    }
  }
}

export default Visualizer;

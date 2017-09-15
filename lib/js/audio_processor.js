import $ from 'jquery';

class AudioProcessor {
  constructor() {
    this.inputAudioCtx;
    this.offlineCtx;
    this.outputAudioCtx;
    this.analyzer;
    this.source;
    this.currentFile;
    this.trackStatus = document.querySelector(".track-status");
    this.trackTitle = document.querySelector(".track-title");

    this.handleEnd = this.handleEnd.bind(this);
  }

  init() {
    this.inputAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  loadAndPlaySample(url) {
    const request = new XMLHttpRequest();
    this.currentFile = url.slice(19);
    request.open("GET", url);
    request.responseType = "arraybuffer";

    request.onload = () => {
      this.play(request.response);
    };

    this.trackStatus.textContent = "Loading audio...";
    request.send();
  }

  handleUpload(upload) {
    this.trackStatus.textContent = "Loading audio...";
    this.trackTitle.textContent = "";
    if (upload.files.length > 0) {
      this.readAudioFile(upload.files[0]);
    }
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
    $(".audio-btn").each(function () {
      $(this).removeClass("null");
    });

    $(".fa-play").addClass("null");

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
        self.outputAudioCtx = self.outputAudioCtx || new (window.AudioContext || window.webkitAudioContext)();

        self.analyzer =
          self.analyzer || self.outputAudioCtx.createAnalyser();

        const track = self.outputAudioCtx.createBufferSource();
        track.buffer = renderedBuffer;
        track.connect(self.analyzer);
        self.analyzer.connect(self.outputAudioCtx.destination);

        if (self.source) self.source.disconnect();

        self.trackTitle.textContent = self.currentFile;
        self.trackStatus.textContent = "Playing";
        self.source = track;
        self.source.start();

        self.source.onended = self.handleEnd;
      });
    });
  }

  resume() {
    if (this.outputAudioCtx && this.outputAudioCtx.state === "suspended") {
      $(".fa-play").addClass("null");
      this.outputAudioCtx.resume();
      this.trackStatus.textContent = "Playing";
      return true;
    }
    return false;
  }

  pause() {
    if (this.outputAudioCtx && this.outputAudioCtx.state === "running") {
      $(".fa-pause").addClass("null");
      this.outputAudioCtx.suspend();
      this.trackStatus.textContent = "Paused";
      return true;
    }
    return false;
  }

  stop() {
    if (this.outputAudioCtx) {
      if (this.outputAudioCtx.state === "suspended") this.resume();
      return true;
    }
    return false;
  }

  handleEnd() {
    if (this.source) {
      this.source.disconnect();
      this.source.stop(0);
    }

    this.trackStatus.textContent = "";
    this.trackTitle.textContent = "";
    this.currentFile = null;
    $(".audio-btn").addClass("null");

    setTimeout(() => {
      this.source = null;
    }, 1000);
  }
}

export default AudioProcessor;

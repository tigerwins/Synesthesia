# Synesthesia - 3D Audio Visualizer

[Synesthesia live][synesthesia]

[synesthesia]: http://jonathanzliu.com/Synesthesia


Synesthesia is a browser-based 3D music visualizations that matches and emphasizes the music being played. It was created using the Three.js rendering library and the Web Audio API.

## Technologies

* Three.js
* Web Audio API
* TweenMax (from GSAP)
* jQuery

## Features and Implementation

### Visualizations

#### Lights

The introduction with no response to audio, but is a pleasant home screen that is somewhere between fireflies dancing and freshly-fallen snow.

#### Bars

A typical bar visualization that matches the height of each bar to a different frequency in the audio data after performing a Fast Fourier Transform. Makes use of camera tweening to create the visual effect of the camera smoothly flying around the scene.

![tweening](https://github.com/tigerwins/Synesthesia/blob/master/assets/images/tween.png "Tweening")

#### Helix

A colorful visualization that makes use of the TubeGeometry and PointsMaterial to create a helix which rotates at a speed determined by the lower frequencies; the lowest portion of the audio buffer was used as a primitive form of beat detection.

![rmsVolumeLow](https://github.com/tigerwins/Synesthesia/blob/master/assets/images/rms-volume.png "RMS Volume")

The colors cycled at a speed determined by the higher portion of the audio buffer. Volumes were calculated by taking the Root Mean Square of the array of frequency amplitudes within each range.

### Music Uploads

While Synesthesia comes with a few sample tracks, the key draw is that you can now see the effects your own music can have on the visualizations. Resampling of any input audio guarantees that the audio data input that the animation methods use will be consistent across audio files.

## Development

To run this demo locally, you must clone the repository, navigate to the Synesthesia directory, and run the following commands:

```
npm install
npm run webpack
npm run http-server
```

After http-server is up and running, you should be able to access the demo at localhost:8080 in your web browser.

## Future Features

I hope to continue working on this project, especially as a way to learn more about Three.js. There are several additions that I would like to add:

### More visualizations

Another visualization that I would like to create is something similar to an armillary sphere, with three concentric bands that rotate around a central light source.

### Smoothed out camera controls

Currently, Three's default OrbitControls are very bumpy and make for a very unpleasant user experience when added. I plan to delve deeper into the documentation to find a way to smooth out arrow-key camera controls so that users may orbit the bars visualization manually.

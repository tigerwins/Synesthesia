# Synesthesia - 3D Audio Visualizer

## JavaScript Project Proposal

### MVP Features

Synesthesia will be able to render 3D visualizations that match and emphasize the music being played. It will have the following features:

* Music playback (either a sample track or one of the user's choosing)
* 3D rendering in time with the music
* Camera movement

### Technologies, Libraries, APIs

This project will make use of the **Web Audio API** to create a context with any audio being played. It will be combined with the **Three.js** 3D rendering library to create a couple visualizations that the user can then view from different angles using camera controls.

### Wireframes

Landing Page Modal will have a simple toggle button in the top right of the main page  
![image of landing page](https://github.com/tigerwins/Synesthesia/blob/master/images/modal.png "landing page modal")

Home page will have drop-down menus to choose visualizations and music in the top left, playback controls in the bottom left, and links to personal site, Github, and LinkedIn in the bottom right  
![image home page](https://github.com/tigerwins/Synesthesia/blob/master/images/home-screen.png "home page")

### Implementation Timeline

**Day 1** - Create first visualization (bars)
* Develop geometries and materials
* Match mesh with music
* Smooth over transitions

**Day 2** - Create second visualization (helix)
* Develop geometries and materials
* Match mesh with music
* Smooth over transitions

**Day 3** - Implement camera movement
* Implement TweenMax to handle camera transitions
* Wrap up animation loose ends

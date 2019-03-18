import {vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Terrain from './geometry/Terrain';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Elevation Seed': 10,
  'Map Type': 1
};

//gui controls
const gui = new DAT.GUI();

//stats for rendering
const stats = Stats();

//the canvas to draw on
const canvas = <HTMLCanvasElement> document.getElementById('canvas');

//gl context
const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');

//camera
const camera = new Camera(vec3.fromValues(50, 50, 10), vec3.fromValues(50, 50, 0));

//renderer
const renderer = new OpenGLRenderer(canvas);

//the terrain to render
let terrain: Terrain;

//time tick
let time: number = 0.0;

//shader program
let flat: ShaderProgram;

function loadScene() {
  terrain = new Terrain();
  terrain.setElevationSeed(controls["Elevation Seed"]);
  terrain.create();
}

function drawScene() {
  camera.update();
  stats.begin();
  flat.setTime(time++);
  gl.viewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.clear();
  renderer.render(camera, flat, [terrain], controls["Map Type"]);
  stats.end();
}

function loadAndDrawScene() {
  loadScene();
  drawScene();
}

function addControls() {
  let eSeed = gui.add(controls, 'Elevation Seed', 1, 100).step(1).listen();
  eSeed.onChange(loadAndDrawScene);
  let mapType = gui.add(controls, 'Map Type', {'elevation': 1, 'flat': 2, 'population density': 3}).listen();
  mapType.onChange(loadAndDrawScene);
}

function initStats() {
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
}

function main() {
  // Initial display for framerate

  initStats();
  addControls();
  document.body.appendChild(stats.domElement);


  // get canvas and webgl context
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);


  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);


  flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  // Start the render loop
  // Initial call to load scene
  loadAndDrawScene();
}

main();

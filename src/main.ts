import {vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Elevation Seed': 10
};

// Add controls to the gui
const gui = new DAT.GUI();
const stats = Stats();
const canvas = <HTMLCanvasElement> document.getElementById('canvas');
const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
const camera = new Camera(vec3.fromValues(50, 50, 10), vec3.fromValues(50, 50, 0));
const renderer = new OpenGLRenderer(canvas);

let screenQuad: ScreenQuad;
let time: number = 0.0;
let flat: ShaderProgram;

function loadScene() {
  screenQuad = new ScreenQuad();
  screenQuad.setElevationSeed(controls["Elevation Seed"]);
  screenQuad.create();
}

function drawScene() {

  camera.update();
  stats.begin();
  flat.setTime(time++);
  gl.viewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.clear();
  renderer.render(camera, flat, [screenQuad]);
  stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    //requestAnimationFrame(tick);
}

function loadAndDrawScene() {
  loadScene();
  drawScene();
}

function addControls() {
  let eSeed = gui.add(controls, 'Elevation Seed', 1, 100).step(1).listen();
  eSeed.onChange(loadAndDrawScene);
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



  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  // Initial call to load scene
  loadAndDrawScene();
}

main();

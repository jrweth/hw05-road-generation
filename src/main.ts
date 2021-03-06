import {vec2, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Terrain from './geometry/Terrain';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import InstancedShaderProgram from './rendering/gl/InstancedShaderProgram';
import {LSystem} from "./lsystem/lsystem";
import Roads from "./lsystem/roads";
import RoadSegments from "./geometry/RoadSegments";
import {VecMath} from "./utils/vec-math";

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
let getUrlParameter = (name: string)  => {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

let controls=  {
  'Elevation Seed': 1,
  'Population Seed': 1,
  'Road Seed': 1,
  'Map Type': 3,
  'Iterations': 5
};

//hacky hacky hacky
try {
  let controlsString: string = getUrlParameter('controls');
  let controlObject = JSON.parse(controlsString);
  controls['Elevation Seed'] = controlObject['Elevation Seed'];
  controls['Population Seed'] = controlObject['Population Seed'];
  controls['Road Seed'] = controlObject['Road Seed'];
  controls['Map Type'] = controlObject['Map Type'];
}
catch(e) {

}



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

let roadSegments: RoadSegments;

//time tick
let time: number = 0.0;

//shader program
let terrainShader: ShaderProgram;

//road shader
let roadShader: InstancedShaderProgram;

//road lsystem
let roadLSystem: Roads;

function loadScene() {
  let aspectRatio: number = window.innerWidth / window.innerHeight;
  let divisions: vec2 = vec2.fromValues(Math.floor(aspectRatio * 100), 100);
  let dimensions: vec2 = vec2.fromValues(window.innerWidth, window.innerHeight);


  terrain = new Terrain();
  //terrain.setDivisions(divisions);
  terrain.setDimensions(dimensions);
  terrain.setElevationSeed(controls["Elevation Seed"]);
  terrain.setPopulationSeed(controls["Population Seed"]);
  terrain.create();

  roadSegments = new RoadSegments();
  roadSegments.create();
  roadLSystem = new Roads(controls.Iterations, {
    seed: controls["Road Seed"],
    terrain: terrain
  });
  roadLSystem.runExpansionIterations();
  roadLSystem.runDrawRules();
  roadLSystem.addNeighborhoods();
  roadSegments.setInstanceVBOs(roadLSystem.segments, roadLSystem.intersections);

}

function drawScene() {
  camera.update();
  stats.begin();
  terrainShader.setTime(time++);
  roadShader.setTime(time);
  gl.viewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.clear();
  gl.useProgram(terrainShader.prog);
  renderer.render(camera, terrainShader, [terrain], controls["Map Type"]);
  gl.useProgram(roadShader.prog);
  renderer.render(camera, roadShader, [roadSegments]);
  stats.end();
}

function loadAndDrawScene() {
  loadScene();
  drawScene();
}

//hacky
function reload() {
  let url: string = window.location.href;
  let loc = url.indexOf('?');
  if(loc == -1) {
    window.location.href =  url +'?controls=' + JSON.stringify(controls);
  }
  else {
    window.location.href = url.substr(0, loc) +'?controls=' + JSON.stringify(controls);

  }
}

function addControls() {
  let eSeed = gui.add(controls, 'Elevation Seed', {'seed1': 1, 'seed 2': 5.43, 'seed 3': 8.987, 'seed 4': 89.3943}).listen();
  eSeed.onChange(reload);
  let pSeed = gui.add(controls, 'Population Seed', {'seed1': 1, 'seed 2': 5.43, 'seed 3': 8.987, 'seed 4': 43.343}).listen();
  pSeed.onChange(reload);
  let rSeed = gui.add(controls, 'Road Seed', {'seed1': 1, 'seed 2': 5.43, 'seed 3': 8.987, 'seed 4': 43.343}).listen();
  rSeed.onChange(reload);
  let mapType = gui.add(controls, 'Map Type', {'elevation': 1, 'flat': 2, 'population density': 3}).listen();
  mapType.onChange(reload);
  // let iter = gui.add(controls, 'Iterations', 1, 100).step(1).listen();
  // iter.onChange(loadAndDrawScene);
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


  terrainShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/terrain-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/terrain-frag.glsl')),
  ]);

  roadShader = new InstancedShaderProgram( [
    new Shader(gl.VERTEX_SHADER, require('./shaders/road-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/road-frag.glsl')),
  ]);



  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  terrainShader.setDimensions(window.innerWidth, window.innerHeight);
  roadShader.setDimensions(window.innerWidth, window.innerHeight);

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    terrainShader.setDimensions(window.innerWidth, window.innerHeight);
    roadShader.setDimensions(window.innerWidth, window.innerHeight);

  }, false);

  // Start the render loop
  // Initial call to load scene
  loadAndDrawScene();
}

main();


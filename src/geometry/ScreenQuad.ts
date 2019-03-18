import {vec2} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import Random from '../noise/random';

class ScreenQuad extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  dimensions: vec2;
  divisions: vec2;
  elevationSeed: number;

  constructor() {
    super();
    this.divisions = vec2.fromValues(100, 100);
  }

  setElevationSeed(seed: number): void {
    this.elevationSeed = seed;
  }

  setDimensions(dimensions: vec2): void {
    this.dimensions = dimensions;
  }

  setDivisions(divisions: vec2): void {
    this.divisions = divisions;
  }

  create() {
    let indicies: number[] = [];
    let positions: number[] = [];
    let colors: number[] = [];
    for(let i = 0; i <= this.divisions[0]; i++) {
      for(let j = 0; j <= this.divisions[1] ; j++) {
        let x = -1 + (2.0 * i / this.divisions[0]);
        let y = -1 + (2.0 * j / this.divisions[1]);
        positions.push(x, y, 0, 1);

        //get eleation from fbm
        let seed: vec2 = vec2.fromValues(this.elevationSeed, 13.322);

        let elevation = Random.fbm2to1(vec2.fromValues(3.0 * i / this.divisions[0], 3.0 * j / this.divisions[1]), seed);
        console.log(elevation);
        colors.push(elevation, 0, 0, 1);

        if(i < this.divisions[0] && j < this.divisions[1]) {
          let p1: number = (this.divisions[0] + 1) * i + j;
          let p2: number = (this.divisions[0] + 1) * i + j + 1;
          let p3: number = (this.divisions[0] + 1) * (i + 1) + j;
          let p4: number = (this.divisions[0] + 1) * (i + 1) + j + 1;

          indicies.push(p1, p2, p3, p3, p2, p4);
        }
      }
    }

    this.indices = new Uint32Array([0, 1, 2]);
    this.positions = new Float32Array([-1, -1, 0.999, 1,
                                     1, -1, 0.999, 1,
                                     1, 1, 0.999, 1]);
    this.colors = new Float32Array([-1, -1, 0.999, 1,
      1, -1, 0.999, 1,
      1, 1, 0.999, 1]);
    this.indices = new Uint32Array(indicies);
    this.positions = new Float32Array(positions);
    this.colors = new Float32Array(colors);
    //this.colors = new Float32Array([1,0,0,1,
    // 0,1,0,1,
    // 0,0,1,1,
    // 1,1,1,1]);

    this.generateIdx();
    this.generatePos();
    this.generateCol();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    this.numInstances = 1;

    console.log(`Created ScreenQuad`);
  }
};

export default ScreenQuad;

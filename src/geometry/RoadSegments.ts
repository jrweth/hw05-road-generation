import {gl} from '../globals';
import InstancedDrawable from "../rendering/gl/InstancedDrawable";
import {Segment} from "../lsystem/lsystem";
import {RoadType} from "../lsystem/turtle";
import {vec2} from "gl-matrix";

class RoadSegments extends InstancedDrawable {
  indices: Uint32Array;
  positions: Float32Array;
  offsets: Float32Array; // Data for bufTranslate
  colors: Float32Array; // Data for bufTranslate


  constructor() {
    super(); // Call the constructor of the super class. This is required.
  }

  create() {


    this.indices = new Uint32Array([0, 1, 2,
      1, 3, 2]);
    this.positions = new Float32Array([0, -0.5, -0.001, 1,
      0, 0.5, -0.001, 1,
      1, -0.5, -0.001, 1,
      1, 0.5, -0.001, 1]);

    this.generateIdx();
    this.generatePos();
    this.generateTranslate();
    this.generateCol();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

  }

  setInstanceVBOs(segments: Segment[]) {
    let offsets: number[] = [];
    let colors: number[] = [];
    let width: number;

    this.numInstances = segments.length;

    for(let i = 0; i < segments.length; i++) {
      offsets.push(segments[i].startPoint[0], segments[i].startPoint[1], 0);

      switch(segments[i].roadType) {
        case RoadType.HIGHWAY: width = 0.01; break
        case RoadType.ROAD:    width = 0.005; break
      }
      length = vec2.dist(segments[i].startPoint, segments[i].endPoint);
      colors.push(length, width, segments[i].rotation, 0);
    }

    this.offsets = new Float32Array(offsets);
    this.colors = new Float32Array(colors);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    gl.bufferData(gl.ARRAY_BUFFER, this.offsets, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
  }
};

export default RoadSegments;

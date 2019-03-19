import {vec2} from 'gl-matrix';


export enum RoadType {
  HIGHWAY = 1,
  ROAD = 2,
}

/**
 * Struct to hold the parameters for the turtle
 */
export class Turtle {

  //the direction the turtle is facing represented by angle in radians
  dir: number = Math.PI / 2;

  //the position where the turtle exists
  pos: vec2 = vec2.fromValues(0.0, 0.0);

  //the type of road
  roadType: RoadType = RoadType.HIGHWAY;

  segmentLength: number = 0.05;
  lengthScale: number = 0.9;

  angle: number = 90;
  angleScale: number = 0.9;

}

export function cloneTurtle(turtle: Turtle): Turtle {
  let newTurtle: Turtle = new Turtle();

  let pos:vec2 = vec2.create();
  vec2.copy(pos, turtle.pos);

  newTurtle.dir = turtle.dir;
  newTurtle.pos = pos;
  newTurtle.roadType = turtle.roadType;
  newTurtle.segmentLength = turtle.segmentLength;
  newTurtle.lengthScale = turtle.lengthScale;
  newTurtle.angle = turtle.angle;
  newTurtle.angleScale = turtle.angleScale;

  return newTurtle;
}
import {BaseDrawRule} from "./base-draw-rule";
import {DrawRule} from "./draw-rule";
import {cloneTurtle, Turtle} from "../turtle";
import {LSystem, Segment} from "../lsystem";
import {vec2} from "gl-matrix";

export class Draw extends BaseDrawRule implements DrawRule {
  lsystem: LSystem;

  constructor(options: {lsystem: LSystem}) {
    super(options);
    this.lsystem = options.lsystem;
  }

  draw(turtle: Turtle, turtleStack: Turtle[], segments: Segment[], newSegments: Segment[]) {

    //create the standard segment
    let segment = new Segment();
    let distance: vec2 = vec2.fromValues(
      Math.cos(turtle.dir) * turtle.segmentLength,
      Math.sin(turtle.dir) * turtle.segmentLength
    );
    segment.startPoint = turtle.pos;
    segment.endPoint = vec2.create();
    vec2.add(segment.endPoint, segment.startPoint, distance);
    segment.roadType = turtle.roadType;
    segment.rotation = turtle.dir;

    //try to add the segment
    let addSegment = this.lsystem.addSegment(segment);
    //if successful move our turtle
    if(addSegment !== null) {
      turtle.pos = addSegment.endPoint;
      turtle.dir = addSegment.rotation;
    }

    return turtle;
  }
}
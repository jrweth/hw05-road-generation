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

  draw(turtle: Turtle, turtleStack: Turtle[], segments: Segment[] ) {

    //create the standard segment
    let distance: vec2 = vec2.fromValues(
      Math.cos(turtle.dir) * turtle.segmentLength,
      Math.sin(turtle.dir) * turtle.segmentLength
    );
    let endPoint = vec2.create();
    vec2.add(endPoint, turtle.pos, distance);

    //try to add the segment
    let addSegment = this.lsystem.addSegment(
      turtle.lastIntersectionId,
      endPoint,
      turtle.dir,
      turtle.roadType
    );
    //if successful move our turtle
    if(addSegment !== null) {
      turtle.pos = this.lsystem.intersections[addSegment.endIntersectionId].pos;
      turtle.dir = addSegment.rotation;
      turtle.lastIntersectionId = addSegment.endIntersectionId;
    }
    else {
      turtle.branchEnded = true;
    }

    return turtle;
  }
}
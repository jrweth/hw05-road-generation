import {BaseDrawRule} from "./base-draw-rule";
import {DrawRule} from "./draw-rule";
import {Turtle} from "../turtle";
import {Segment} from "../lsystem";

export class TurnRight extends BaseDrawRule implements DrawRule {
  draw(turtle: Turtle, turtleStack: Turtle[], segments: Segment[], options?: string) {

    let angle: number = turtle.angle;
    if(!isNaN(parseFloat(options))) {
      angle = parseFloat(options);
    }

    console.log(turtle.dir);
    turtle.dir -= angle;
    console.log(turtle.dir);
    return turtle;
  }
}

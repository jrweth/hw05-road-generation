import {BaseDrawRule} from "./base-draw-rule";
import {DrawRule} from "./draw-rule";
import {cloneTurtle, Turtle} from "../turtle";
import {Segment} from "../lsystem";

export class EndBranch extends BaseDrawRule implements DrawRule {
  draw(turtle: Turtle, turtleStack: Turtle[], segments: Segment[] ) {
    turtle = turtleStack.pop();
    return turtle;
  }
}
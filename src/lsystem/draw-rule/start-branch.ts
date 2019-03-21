import {BaseDrawRule} from "./base-draw-rule";
import {DrawRule} from "./draw-rule";
import {cloneTurtle, Turtle} from "../turtle";
import {Segment} from "../lsystem";
import Terrain from "../../geometry/Terrain";
import Prando from "prando";

export class StartBranch extends BaseDrawRule implements DrawRule {


  draw(turtle: Turtle, turtleStack: Turtle[], segments: Segment[], newSegments: Segment[]) {
    turtleStack.push(cloneTurtle(turtle));
    return turtle;
  }
}

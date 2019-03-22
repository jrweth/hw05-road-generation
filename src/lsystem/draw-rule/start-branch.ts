import {BaseDrawRule} from "./base-draw-rule";
import {DrawRule} from "./draw-rule";
import {cloneTurtle, Turtle} from "../turtle";
import {Segment} from "../lsystem";
import Terrain from "../../geometry/Terrain";
import Prando from "prando";

export class StartBranch extends BaseDrawRule implements DrawRule {
  terrain: Terrain;

  constructor(options: {terrain: Terrain}) {
    super(options);
    this.terrain = options.terrain;
  }

  draw(turtle: Turtle, turtleStack: Turtle[], segments: Segment[] ) {
    turtleStack.push(cloneTurtle(turtle));
    if(!this.terrain.positionOnLand(turtle.pos)) {
    //if(false) {
      turtle.branchEnded = true;
    }
    return turtle;
  }
}

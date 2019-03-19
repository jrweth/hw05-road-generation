import {LSystem, Segment} from "../lsystem";

export interface Constraint {
  checkConstraint(lsystem: LSystem, segment: Segment): boolean;
  attemptAdjustment(lsystem: LSystem, segement: Segment): boolean;
}
import {LSystem, Segment} from "../lsystem";
import Terrain from "../../geometry/Terrain";
import {RoadType} from "../turtle";
import {vec2} from "gl-matrix";
import Roads from "../roads";


export class ConstraintAdjustment {
  added: boolean;
  intersected: boolean;
  segment: Segment;
}

export interface Constraint {
  checkConstraint(segment: Segment, endPosition: vec2): boolean;
  attemptAdjustment(segment: Segment, endPosition: vec2): ConstraintAdjustment;
}


export class WaterConstraint implements Constraint {
  terrain: Terrain;
  roads: Roads;
  constructor(options: {terrain: Terrain, roads: Roads}) {
    this.terrain = options.terrain;
    this.roads = options.roads;
  }

  checkConstraint(segment: Segment, endPos: vec2): boolean {
    if(segment.roadType == RoadType.STREET) {
      console.log('checking water constraint');
      if(!this.terrain.positionOnLand(endPos)) {
        return false;
      }
    }
    return true;
  }

  attemptAdjustment(segment: Segment, endPos: vec2): ConstraintAdjustment {
    let adj = new ConstraintAdjustment();
    adj.added = false;
    adj.intersected = false;{
      false
    };

    return adj;
  }
}
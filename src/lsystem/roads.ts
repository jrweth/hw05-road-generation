import {Intersection, LSystem, Segment} from "./lsystem";
import {XReplace} from "./x-rule/x-replace";
import {TurnTowardPopulation} from "./draw-rule/turn-toward-population";
import {vec2} from "gl-matrix";
import Terrain, {TerrainSection} from "../geometry/Terrain";
import {TurnAwayPopulation} from "./draw-rule/turn-away-population";
import {SpanPopulation} from "./draw-rule/span_population";
import {RoadType, Turtle} from "./turtle";
import {StartBranch} from "./draw-rule/start-branch";
import {Constraint, WaterConstraint} from "./constraint/constraint";

class RoadSection {
  terrainSection: TerrainSection;
  intersectionIds: number[] = [];
}

class Roads extends LSystem {
  roadGrid: RoadSection[][]  = [];
  terrain: Terrain;

  //constructor
  constructor(iterations: number, options: {
    seed: number,
    terrain: Terrain
  }) {
    super(iterations, options);
    this.terrain = options.terrain;
    this.initRoadSections();

    this.axiom = 'FL';
    this.addStandardDrawRules();

    this.addDrawRule('P', new TurnTowardPopulation({
      seed: this.options.seed,
      terrain: this.options.terrain
    }));

    this.addDrawRule('p', new TurnAwayPopulation({
      seed: this.options.seed,
      terrain: this.options.terrain
    }));

    this.addDrawRule('S', new SpanPopulation({
      seed: this.options.seed,
      terrain: this.options.terrain
    }));

    this.addDrawRule('[', new StartBranch({terrain: this.terrain}));

    this.addXRule('B', new XReplace('[-LB][+LB]'));
    this.addXRule('L', new XReplace('FPFPFPFPF[--L]PFPFPFPF[-L]PFPFPFPFPPFPFPFPF[++L]PFPFPFPFPFL'));
    this.addXRule('X', new XReplace('[-FX][FX][+FX]'));

    this.addConstraint(new WaterConstraint({terrain: this.terrain, roads: this}));


  }

  addConstraint(constraint: Constraint) {
    this.constraints.push(constraint);
  }

  addIntersection(intersection: Intersection) {
    super.addIntersection(intersection);

    //add the intersection to the appropriate grid section
    let gridIndex: vec2 = this.terrain.screenPosToGridIndex(intersection.pos);
    this.roadGrid[gridIndex[0]][gridIndex[1]].intersectionIds.push(this.intersections.length -1);
  }

  //Loop through all of the terrain divisions and create a Raod
  initRoadSections() {
    //loop through the terrain trid
    this.roadGrid = [];
    for(let i = 0; i < this.terrain.divisions[0]; i++) {
      this.roadGrid.push([]);
      for(let j = 0; j < this.terrain.divisions[0]; j++) {
        this.roadGrid[i].push(new RoadSection());
        this.roadGrid[i][j].terrainSection = this.terrain.sectionGrid[i][j];
      }
    }
  }

  addNeighborhoods(): void {
    this.axiom = 'FXFFXFXFFX';
    this.iterations = 5;
    this.runExpansionIterations();

    let numInt = this.intersections.length;
    let numNeighborhoods = 1000;
    for(let i = 0; i < numNeighborhoods; i++) {
      let intId = Math.floor(i * numInt / numNeighborhoods);
      this.addNeighborhood(intId, Math.PI * i / 6);
    }

  }

  addNeighborhood(intersectionId: number, startDir: number) {
    this.turtle = new Turtle();
    this.turtle.roadType = RoadType.STREET;
    this.turtle.dir = startDir;
    this.turtle.lastIntersectionId = intersectionId;
    this.turtle.angle = Math.PI / 2;
    this.turtle.pos = this.intersections[intersectionId].pos;
    this.runDrawRules();

  }


}

export default Roads;
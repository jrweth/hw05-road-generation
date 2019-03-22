import {Intersection, LSystem} from "./lsystem";
import {XReplace} from "./x-rule/x-replace";
import {TurnTowardPopulation} from "./draw-rule/turn-toward-population";
import {vec2} from "gl-matrix";
import Terrain, {TerrainSection} from "../geometry/Terrain";
import {TurnAwayPopulation} from "./draw-rule/turn-away-population";
import {SpanPopulation} from "./draw-rule/span_population";

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

    this.addXRule('B', new XReplace('[-LB][+LB]'))
    this.addXRule('L', new XReplace('FPFPFPFPF[--L]PFPFPFPFPFPFPFFPFPFPFPF[++L]PFPFPFPFPFL'));
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

  addStreets() {

  }

}

export default Roads;
import {Intersection, LSystem, Segment} from "./lsystem";
import {XReplace} from "./x-rule/x-replace";
import {TurnTowardPopulation} from "./draw-rule/turn-toward-population";
import {vec2} from "gl-matrix";
import Terrain, {TerrainSection} from "../geometry/Terrain";
import {TurnAwayPopulation} from "./draw-rule/turn-away-population";
import {SpanPopulation} from "./draw-rule/span_population";
import {RoadType, Turtle} from "./turtle";

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


    this.addXRule('B', new XReplace('[-LB][+LB]'));
    this.addXRule('L', new XReplace('FPFPFPFPF[--L]PFPFPFPFPFPFPFFPFPFPFPF[++L]PFPFPFPFPFL'));
    this.addXRule('X', new XReplace('[-F[+F]F[+F]F[+F]F[+F]F[+F]F[+F]F[+F]F[+F]F[+F]F[+F]]'));
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
    this.turtle = new Turtle();
    this.turtle.roadType = RoadType.STREET;

    this.addNeighborhood(0, Math.PI / 4);

  }

  addNeighborhood(intersectionId: number, startDir: number) {
    this.axiom = 'FXFFXFXFFX';
    this.iterations = 10;
    this.runExpansionIterations();
    this.turtle.dir = startDir;
    this.turtle.roadType = RoadType.STREET;
    this.turtle.lastIntersectionId = intersectionId;
    this.turtle.angle = Math.PI / 2;
    this.runDrawRules();

  }

  // addNeighborhood(intersectionId: number, startDir: number) {
  //   this.addNeighborhood2(intersectionId, startDir);
  //   let startPos: vec2 = this.intersections[intersectionId].pos;
  //   let firstIndex = this.intersections.length;
  //
  //   for(let i = 0; i < 20; i++) {
  //     for(let j = 0; j < 20; j++) {
  //
  //       let xStep = Math.cos(startDir)*i + Math.sin(startDir)*j;
  //       let yStep = -Math.sin(startDir)*i + Math.cos(startDir)*j;
  //       let intersection = new Intersection();
  //       intersection.pos = vec2.create();
  //       intersection.pos[0] = startPos[0] + xStep * 0.03;
  //       // intersection.pos[0] = startPos[0] + i * Math.cos(startDir) * 0.1;
  //       intersection.pos[1] = startPos[1] + yStep * 0.03;
  //       // intersection.pos[1] = startPos[1] + j * Math.sin(startDir) * 0.1;
  //
  //       this.addIntersection(intersection);
  //
  //       if(i < 19 && j < 19) {
  //         let seg1 = new Segment();
  //         seg1.startIntersectionId = firstIndex + (i * 20) + j;
  //         seg1.endIntersectionId = firstIndex + (i * 20) + j + 1;
  //         seg1.rotation = startDir;
  //         seg1.roadType = RoadType.STREET;
  //         this.segments.push(seg1);
  //
  //         let seg2 = new Segment();
  //         seg2.startIntersectionId = firstIndex + (i * 20) + j;
  //         seg2.endIntersectionId = firstIndex + (i * 20) + j + 1;
  //         seg2.rotation = startDir;
  //         seg2.roadType = RoadType.STREET;
  //         this.segments.push(seg1);
  //       }
  //
  //     }
  //   }
  //
  // }



}

export default Roads;
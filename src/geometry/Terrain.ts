import {vec2} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import Noise from '../noise/noise';
import {VecMath} from "../utils/vec-math";
import Random from "../noise/random";

export class TerrainSection {
  cornerElevation: number;
  cornerDensity: number;
  minElevation: number;
  avgDensity: number;
}

class Terrain extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  dimensions: vec2;
  divisions: vec2 = vec2.fromValues(100, 100);
  elevationSeed: number = 1.234;
  populationSeed: number = 2.345;
  populationPoints: vec2[];
  numPopultationPoints: vec2 = vec2.fromValues(2, 3);
  aspectRatio: number = 1;
  sectionGrid: TerrainSection[][] = [[]];
  waterLine: number = 0.4;

  constructor() {
    super();
    this.divisions = vec2.fromValues(100, 100);
  }

  setElevationSeed(seed: number): void {
    this.elevationSeed = seed;
  }

  setPopulationSeed(seed: number): void {
    this.populationSeed = seed;
  }

  setDimensions(dimensions: vec2): void {
    this.dimensions = dimensions;
    this.aspectRatio = dimensions[0] / dimensions[1];
  }

  setDivisions(divisions: vec2): void {
    this.divisions = divisions;
  }

  screenPosToWorlyPos(screenPos: vec2): vec2 {
    let worleyX: number = ((1 + screenPos[0]) / 2.0) * this.numPopultationPoints[0];
    let worleyY: number = ((1 + screenPos[1]) / 2.0) * this.numPopultationPoints[1];
    let worleyPos: vec2 = vec2.fromValues(worleyX, worleyY);
    return worleyPos;
  }


  screenPosToGridPos(screenPos: vec2): vec2 {
    let gridX: number = ((1 + screenPos[0]) / 2.0) * this.divisions[0];
    let gridY: number = ((1 + screenPos[1]) / 2.0) * this.divisions[1];
    let gridPos: vec2 = vec2.fromValues(gridX, gridY);
    return gridPos;
  }

  /**
   * Get the grid index for the screen position
   * @param screenPos
   */
  screenPosToGridIndex(screenPos: vec2): vec2 {
    let gridPos: vec2 = this.screenPosToGridPos(screenPos);
    gridPos[0] = VecMath.clamp(Math.floor(gridPos[0]), 0, this.divisions[0]-1);
    gridPos[1] = VecMath.clamp(Math.floor(gridPos[1]), 0, this.divisions[1]-1);
    return gridPos;
  }

  //get the terrain section from the grid position
  screenPosToTerrainSection(screenPos: vec2): TerrainSection {
    let gridPos: vec2 = this.screenPosToGridPos(screenPos);
    let gridX = Math.floor(gridPos[0]);
    let gridY = Math.floor(gridPos[1]);
    return this.sectionGrid[gridX][gridY];
  }

  worleyPosToScreenPos(worleyPos: vec2): vec2 {
    return worleyPos;
  }

  getPopulationDensity(screenPos: vec2): number {
    let worleyPos: vec2 = this.screenPosToWorlyPos(screenPos);
    let closestPopPoint = Noise.getClosestWorleyPoint2d(worleyPos, this.numPopultationPoints, this.populationPoints);
    if(closestPopPoint) {
      return Math.pow((1-vec2.dist(worleyPos, closestPopPoint))/1.414, 3);
    }
    return 0;
  }

  //get the elevation at a particular point
  getElevation(screenPos: vec2): number {
    let gridIndex: vec2 = this.screenPosToGridIndex(screenPos);
    let gridPos: vec2 = this.screenPosToGridPos(screenPos);
    let e1 = this.sectionGrid[gridIndex[0]][gridIndex[1]].cornerElevation;
    let e2 = this.sectionGrid[gridIndex[0] + 1][gridIndex[1]].cornerElevation;
    let e3 = this.sectionGrid[gridIndex[0]][gridIndex[1] + 1].cornerElevation;
    let e4 = this.sectionGrid[gridIndex[0] + 1][gridIndex[1] + 1].cornerElevation;
    console

    let elevation = Random.interp2D(gridPos[0] % 1, gridPos[1] % 1, e1, e2, e3, e4);
    return elevation;
  }

  positionOnLand(screenPos: vec2): boolean {
    let gridIndex: vec2 = this.screenPosToGridIndex(screenPos);
    if(this.sectionGrid[gridIndex[0]][gridIndex[1]].minElevation > this.waterLine) return true;
   // if(this.getElevation(screenPos) > this.waterLine) return true;
    return false;
  }

  //get the minimum elevation in the grid which contains the passed in screenPosition
  getGridMinElevation(screenPos: vec2): number {
    let gridIndex :vec2 = this.screenPosToGridIndex(screenPos);
    return this.sectionGrid[gridIndex[0]][gridIndex[1]].minElevation;
  }

  /**
   * loop through grid and calculate min elevation and avg density
   */
  calculateGridAggregates() {
    for(let i = 0; i < this.divisions[0]; i++) {
      for (let j = 0; j < this.divisions[1]; j++) {
        let  minElevation = Math.min(
          this.sectionGrid[i][j].cornerElevation,
          this.sectionGrid[i+1][j].cornerElevation,
          this.sectionGrid[i][j+1].cornerElevation,
          this.sectionGrid[i+1][j+1].cornerElevation,
        );
        this.setSectionGridAttribute(i, j, 'minElevation',minElevation);

        let avgDensity = (
            this.sectionGrid[i][j].cornerElevation +
            this.sectionGrid[i+1][j].cornerElevation +
            this.sectionGrid[i][j+1].cornerElevation +
            this.sectionGrid[i+1][j+1].cornerElevation
        )/4;
        this.setSectionGridAttribute(i, j, 'avgDensity', avgDensity);
      }
    }

  }


  getGridSectionsWithHighPopulation(threshold: number): vec2[] {
    let sections: vec2[] = [];

    for(let i = 0; i < this.divisions[0]; i++) {
      for(let j = 0; j < this.divisions[1]; j++) {
        if(this.sectionGrid[i][j].avgDensity >= threshold) {
          sections.push(vec2.fromValues(i, j));
        }
      }
    }
    return sections;
  }

  /**
   * Set the attribute of a section grid
   * @param x
   * @param y
   * @param attr
   * @param value
   */
  setSectionGridAttribute(x: number, y: number, attr: string, value: number) {
    if(!this.sectionGrid[x]) {
      this.sectionGrid[x] = [];
    }
    if(!this.sectionGrid[x][y]) {
      this.sectionGrid[x][y] = new TerrainSection();
    }
    if(attr == 'cornerElevation') this.sectionGrid[x][y].cornerElevation = value;
    if(attr == 'minElevation')    this.sectionGrid[x][y].minElevation    = value;
    if(attr == 'cornerDensity')   this.sectionGrid[x][y].cornerDensity   = value;
    if(attr == 'avgDensity')      this.sectionGrid[x][y].avgDensity      = value;
  }


  create() {
    let indicies: number[] = [];
    let positions: number[] = [];
    let colors: number[] = [];

    //set up the population centers
    let popSeed = vec2.fromValues(this.populationSeed, 2.5456);
    this.populationPoints = Noise.generateWorleyPoints2d(this.numPopultationPoints, popSeed);

    for(let i = 0; i <= this.divisions[0]; i++) {
      for(let j = 0; j <= this.divisions[1] ; j++) {
        let x = -1 + (2.0 * i / this.divisions[0]);
        let y = -1 + (2.0 * j / this.divisions[1]);
        positions.push(x, y, 0, 1);

        //get eleation from fbm
        let seed: vec2 = vec2.fromValues(this.elevationSeed, 13.322);
        let elevation = Noise.fbm2to1(vec2.fromValues(3.0 * i / this.divisions[0] * this.aspectRatio, 3.0 * j / this.divisions[1]), seed);


        //get population density from worley noise
        let popDensity = this.getPopulationDensity(vec2.fromValues(x, y));

        colors.push(elevation, popDensity, 0, 1);

        if(i < this.divisions[0] && j < this.divisions[1]) {
          let p1: number = (this.divisions[1] + 1) * i + j;
          let p2: number = (this.divisions[1] + 1) * i + j + 1;
          let p3: number = (this.divisions[1] + 1) * (i + 1) + j;
          let p4: number = (this.divisions[1] + 1) * (i + 1) + j + 1;

          indicies.push(p1, p2, p3, p3, p2, p4);

        }
        //save elevation and corner density to grid
        this.setSectionGridAttribute(i, j, 'cornerElevation', elevation);
        this.setSectionGridAttribute(i, j, 'cornerDensity', popDensity);

      }
    }

    this.colors = new Float32Array([-1, -1, 0.999, 1,
      1, -1, 0.999, 1,
      1, 1, 0.999, 1]);
    this.indices = new Uint32Array(indicies);
    this.positions = new Float32Array(positions);
    this.colors = new Float32Array(colors);

    this.generateIdx();
    this.generatePos();
    this.generateCol();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    this.numInstances = 1;

    this.calculateGridAggregates();
  }
};

export default Terrain;

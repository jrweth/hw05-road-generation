import {XRule} from 'x-rule/x-rule';
import {Turtle, RoadType, cloneTurtle} from './turtle';
import {vec2} from "gl-matrix";
import {Constraint} from "./constraint/constraint";
import {TurnRight} from "./draw-rule/turn-right";
import {TurnLeft} from "./draw-rule/turn-left";
import {RandomAngle} from "./draw-rule/random-angle";
import {ScaleLength} from "./draw-rule/scale-length";
import {ScaleAngle} from "./draw-rule/scale-angle";
import {StartBranch} from "./draw-rule/start-branch";
import {EndBranch} from "./draw-rule/end-branch";
import {DrawRule} from "./draw-rule/draw-rule";

export enum SegmentStatus {
  OPEN = "open",
  CLOSED = "closed"
}

export class Segment{
  roadType: RoadType;
  startPoint: vec2;
  endPoint: vec2;
  intersectionIds: number[];
}

export class Intersection {
  segmentsIds: number[];
  pos: vec2;
}

export class LSystem {
  //the axiom to start with
  axiom: string;

  //the segments already created
  segments: Segment[];

  //the new propsed segments
  newSegments: Segment[];

  //the constraints to check for each prospective segment
  constraints: Constraint[];

  //the current number of interations
  curIteration: number;

  //the total number of iterations desired
  iterations: number;

  //the set of expansion rules
  xRules : Map<string, XRule> = new Map();

  //the set of drawing rules
  drawRules : Map<string, DrawRule> = new Map();

  //any options that can be sent into the lsystem
  options: any;

  //the current state of the turtle
  turtle: Turtle = new Turtle;

  //the turtle stack
  turtleStack: Turtle[] = [];

  curString: string;

  //initialize with the options
  constructor(iterations: number, options: any) {
    this.iterations = iterations;
    this.options = options;
    this.curIteration = 0;

  }

  //add an expansion rule
  addXRule(char: string, rule: XRule) {
    this.xRules.set(char, rule);
  }

  addDrawRule(char: string, rule: DrawRule) {
    this.drawRules.set(char, rule);
  }

  //do one iteration over the string
  iterate(iterations: number): void {
    let nextString:string = '';
    let params: any ={iterations: iterations};
    // for(let charIndex:number = 0; charIndex < this.curString.length; charIndex++) {
    //   let func = this.xRules.get(char);
    //   //if rule is found then use
    //   if(func) {
    //     nextString += func.apply(char, params);
    //   }
    //   //if no rule found then just retain the same character
    //   else {
    //     nextString += char;
    //   }
    // }

    this.curIteration++;
  }

  runExpansionIterations() {
    for(let i:number = 0; i < this.iterations; i++) {
      this.iterate(i);
    }
  }


  runDrawRules() {
    //do the initial scaling
    for(let charIndex:number = 0; charIndex < this.curString.length; charIndex++) {
      let char = this.curString.charAt(charIndex);
      let func = this.drawRules.get(char);
      //if rule is found then use
      if(func) {
        //check to see if we have an option string for our draw rule
        let option = '';

        //options for the symbol are encloesed in () -- if they exist get the option
        if(this.curString.charAt(charIndex + 1) == '(') {
          charIndex += 2;
          while(this.curString.charAt(charIndex) !== ')') {
            option += this.curString.charAt(charIndex);
            charIndex++
          }
        }

        this.turtle = func.draw(this.turtle, this.turtleStack, this.segments, this.newSegments, option);
      }
    }
  }



  /**
   * Add the standard rules based off Houdini codes
   */
  addStandardDrawRules(): void {
    this.addDrawRule('+', new TurnRight());
    this.addDrawRule('-', new TurnLeft());
    this.addDrawRule('[', new StartBranch());
    this.addDrawRule(']', new EndBranch());
    this.addDrawRule('~', new RandomAngle({seed: 1}));
    this.addDrawRule('"', new ScaleLength());
    this.addDrawRule(";", new ScaleAngle());
  }


}
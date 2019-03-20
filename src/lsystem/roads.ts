import {LSystem} from "./lsystem";

class Roads extends LSystem {

  //constructor
  constructor(iterations: number, options: any) {
    super(iterations, options);

    this.axiom = 'F';
    this.addStandardDrawRules();
  }
}

export default Roads;
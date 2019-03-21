import {LSystem} from "./lsystem";
import {XReplace} from "./x-rule/x-replace";
import {TurnTowardPopulation} from "./draw-rule/turn-toward-population";
import {vec2} from "gl-matrix";
import Terrain from "../geometry/Terrain";
import {TurnAwayPopulation} from "./draw-rule/turn-away-population";
import {SpanPopulation} from "./draw-rule/span_population";

class Roads extends LSystem {

  //constructor
  constructor(iterations: number, options: {
    seed: number,
    terrain: Terrain
  }) {
    super(iterations, options);

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
}

export default Roads;
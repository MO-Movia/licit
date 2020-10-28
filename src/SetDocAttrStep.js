// @flow

import {Node} from 'prosemirror-model';
import {Step, StepResult, Mappable} from 'prosemirror-transform';

type SetDocAttrStepJSONValue = {
  key: string,
  stepType: string,
  value: any,
};

const STEPNAME_SDA = 'SetDocAttr';

// https://discuss.prosemirror.net/t/changing-doc-attrs/784/17
class SetDocAttrStep extends Step {
  key: string;
  stepType: string;
  value: any;

  constructor(key: string, value: any, stepType?: string = STEPNAME_SDA) {
    super();
    this.stepType = stepType;
    this.key = key;
    this.value = value;
  }

  apply(doc: Node): void {
    this.prevValue = doc.attrs[this.key];
    // avoid clobbering doc.type.defaultAttrs
    // this shall take care of focus out issue too.
    if (doc.attrs === doc.type.defaultAttrs) {
        doc.attrs = Object.assign({}, doc.attrs);
    }
    doc.attrs[this.key] = this.value;
    return StepResult.ok(doc);
  }

  invert(): SetDocAttrStep {
    return new SetDocAttrStep(this.key, this.prevValue, 'revert'+STEPNAME_SDA);
  }

  // [FS] IRAD-1010 2020-07-27
  // Handle map properly so that undo works correctly for document attritube changes.
  map(mapping: Mappable): ?SetDocAttrStep {
    const from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
    if (from.deleted && to.deleted) { return null; }
    return new SetDocAttrStep(this.key, this.value, STEPNAME_SDA);
  }

  merge(other: SetDocAttrStep): ?SetDocAttrStep {
    if (other instanceof SetDocAttrStep &&
        // [FS] IRAD-1028 2020-09-30
        // validate mark
        other.mark && other.mark.eq(this.mark) &&
        this.from <= other.to && this.to >= other.from)
      { return new SetDocAttrStep(this.key, this.value, STEPNAME_SDA); }
      return null;
  }

  toJSON(): SetDocAttrStepJSONValue {
    return {
      stepType: this.stepType,
      key: this.key,
      value: this.value,
    };
  }

  static fromJSON(schema:any, json: SetDocAttrStepJSONValue) {
    return new SetDocAttrStep(json.key, json.value, json.stepType);
  }
}

// [FS] IRAD-899 2020-03-13
// Register this step so that document attrbute changes can be dealt collaboratively.
Step.jsonID(STEPNAME_SDA, SetDocAttrStep);

export default SetDocAttrStep;

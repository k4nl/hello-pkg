
import { v4 as uuidv4, validate } from 'uuid';
import { ValueObject } from './value-object';
export class ID extends ValueObject<string> {
  constructor(value?: string) {
    super(value || uuidv4());
    this.isValid();
  }

  private isValid(): void {
    if (!this.value || this.value.length !== 36) {
      throw new Error('Invalid UUID');
    }

    if (!validate(this.value)) {
      throw new Error('Invalid UUID');
    }
  }
}

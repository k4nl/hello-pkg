import { ID } from "@domain/value-objects";

export type UserProps = {
  id: ID;
  name?: string;
  email: string;
  phone?: string;
}

export type CreateUserCommand = {
  name?: string;
  email: string;
  phone?: string;
}

export class User {
  private id: ID;
  private name?: string;
  private email: string;
  private phone?: string;

  constructor(props: UserProps) {
    this.validate(props);
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
  }

  static create(props: CreateUserCommand): User {
    return new User({
      id: new ID(),
      name: props.name,
      email: props.email,
      phone: props.phone,
    });
  }

  private validate(props: UserProps): void {
    if (!props.id) {
      throw new Error("User ID is required");
    }
    if (!props.email) {
      throw new Error("User email is required");
    }
    if (!(props.id instanceof ID)) {
      throw new Error("User ID must be an instance of ID");
    }
  }

  // Getters

  getId(): string {
    return this.id.value;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getPhone(): string {
    return this.phone;
  }

  toJSON() {
    return {
      id: this.id.value,
      name: this.name,
      email: this.email,
      phone: this.phone,
    };
  }
}
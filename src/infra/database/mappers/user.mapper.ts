import { ID } from "@domain/index";
import { Mapper } from "./mapper";
import { User as UserDomain } from "@domain/user";
import { User as UserModel } from "@prisma/client"

export class UserMapper implements Mapper<UserModel, UserDomain> {

  toDomain(model: UserModel): UserDomain {
    const id = new ID(model.id);
    return new UserDomain({
      id,
      name: model.name,
      email: model.email,
      phone: model.phone,
    });

  }

  toDatabase(domain: UserDomain): UserModel {
    return {
      id: domain.getId(),
      name: domain.getName(),
      email: domain.getEmail(),
      phone: domain.getPhone(),
    } as UserModel;
  }
}
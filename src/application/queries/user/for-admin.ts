import type { Type as User } from "../../dto/user.ts";

export interface IUserQueryForAdmin {
  find(id: User["id"]): Promise<User | undefined>;

  findMany(params: {
    sortKey: "createdAt" | "updatedAt";
    reverse: boolean;
    cursor?: User["id"];
    limit: number;
  }): Promise<User[]>;

  count(): Promise<number>;
}

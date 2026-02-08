import * as Email from "./user/email.ts";
import * as Id from "./user/id.ts";
import * as Name from "./user/name.ts";
import * as Role from "./user/role.ts";

export { Email, Id, Name, Role };

export type Type = {
  id: Id.Type;
  name: Name.Type;
  email: Email.Type;
  role: Role.Type;
  createdAt: Date;
  updatedAt: Date;
};

export const parse = (input: {
  name: string;
  email: string;
}): Pick<Type, "name" | "email"> | ParseError[] => {
  const name = Name.parse(input.name);
  const email = Email.parse(input.email);

  if (
    Array.isArray(name) || //
    Array.isArray(email)
  ) {
    const errors: ParseError[] = [];

    if (Array.isArray(name)) {
      errors.push(...fromNameErrors(name));
    }

    if (Array.isArray(email)) {
      errors.push(...fromEmailErrors(email));
    }

    return errors;
  } else {
    return { name, email };
  }
};

export type ParseError =
  | { prop: "name"; type: Name.ParseError } //
  | { prop: "email"; type: Email.ParseError };

const fromNameErrors = (es: Name.ParseError[]): ParseError[] => {
  return es.map((e) => ({ prop: "name", type: e }));
};

const fromEmailErrors = (es: Email.ParseError[]): ParseError[] => {
  return es.map((e) => ({ prop: "email", type: e }));
};

export const create = (parsed: Exclude<ReturnType<typeof parse>, ParseError[]>): Type => {
  const { id, date } = Id.createWithDate();
  return {
    ...parsed,
    id,
    role: Role.USER,
    createdAt: date,
    updatedAt: date,
  };
};

export const update = (user: Type, input: Partial<Pick<Type, "name">>): Type => {
  return _update(user, input);
};

export const changeEmail = (user: Type, input: Pick<Type, "email">): Type => {
  return _update(user, input);
};

const _update = (user: Type, input: Partial<Pick<Type, "name" | "email">>): Type => ({
  ...user,
  ...input,
  updatedAt: new Date(),
});

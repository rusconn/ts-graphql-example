import { admin, alice, guest } from "it/data/context";
import { AuthorizationError as AuthErr } from "../common/authorizers";
import { authorizers as auth } from "./authorizers";

describe("Query.me", () => {
  const allow = [admin, alice];

  const deny = [guest];

  test.each(allow)("%o", user => {
    expect(() => auth.Query.me(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o", user => {
    expect(() => auth.Query.me(user)).toThrow(AuthErr);
  });
});

describe("Query.users", () => {
  const allow = [admin];

  const deny = [alice, guest];

  test.each(allow)("%o", user => {
    expect(() => auth.Query.users(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o", user => {
    expect(() => auth.Query.users(user)).toThrow(AuthErr);
  });
});

describe("Query.user", () => {
  const allow = [admin];

  const deny = [alice, guest];

  test.each(allow)("%o", user => {
    expect(() => auth.Query.user(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o", user => {
    expect(() => auth.Query.user(user)).toThrow(AuthErr);
  });
});

describe("Mutation.signup", () => {
  const allow = [guest];

  const deny = [admin, alice];

  test.each(allow)("%o", user => {
    expect(() => auth.Mutation.signup(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o", user => {
    expect(() => auth.Mutation.signup(user)).toThrow(AuthErr);
  });
});

describe("Mutation.login", () => {
  const allow = [admin, alice, guest];

  test.each(allow)("%o", user => {
    expect(() => auth.Mutation.login(user)).not.toThrow(AuthErr);
  });
});

describe("Mutation.logout", () => {
  const allow = [admin, alice];

  const deny = [guest];

  test.each(allow)("%o", user => {
    expect(() => auth.Mutation.logout(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o", user => {
    expect(() => auth.Mutation.logout(user)).toThrow(AuthErr);
  });
});

describe("Mutation.updateMe", () => {
  const allow = [admin, alice];

  const deny = [guest];

  test.each(allow)("%o", user => {
    expect(() => auth.Mutation.updateMe(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o", user => {
    expect(() => auth.Mutation.updateMe(user)).toThrow(AuthErr);
  });
});

describe("Mutation.deleteMe", () => {
  const allow = [admin, alice];

  const deny = [guest];

  test.each(allow)("%o", user => {
    expect(() => auth.Mutation.deleteMe(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o", user => {
    expect(() => auth.Mutation.deleteMe(user)).toThrow(AuthErr);
  });
});

describe("User.id", () => {
  const allow = [
    [admin, admin],
    [admin, alice],
    [alice, alice],
  ] as const;

  const deny = [
    [alice, admin],
    [guest, admin],
    [guest, alice],
  ] as const;

  test.each(allow)("%o &o", (user, parent) => {
    expect(() => auth.User.id(user, parent.id)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, parent) => {
    expect(() => auth.User.id(user, parent.id)).toThrow(AuthErr);
  });
});

describe("User.createdAt", () => {
  const allow = [
    [admin, admin],
    [admin, alice],
    [alice, alice],
  ] as const;

  const deny = [
    [alice, admin],
    [guest, admin],
    [guest, alice],
  ] as const;

  test.each(allow)("%o &o", (user, parent) => {
    expect(() => auth.User.createdAt(user, parent.id)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, parent) => {
    expect(() => auth.User.createdAt(user, parent.id)).toThrow(AuthErr);
  });
});

describe("User.updatedAt", () => {
  const allow = [
    [admin, admin],
    [admin, alice],
    [alice, alice],
  ] as const;

  const deny = [
    [alice, admin],
    [guest, admin],
    [guest, alice],
  ] as const;

  test.each(allow)("%o &o", (user, parent) => {
    expect(() => auth.User.updatedAt(user, parent.id)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, parent) => {
    expect(() => auth.User.updatedAt(user, parent.id)).toThrow(AuthErr);
  });
});

describe("User.name", () => {
  const allow = [
    [admin, admin],
    [admin, alice],
    [alice, alice],
  ] as const;

  const deny = [
    [alice, admin],
    [guest, admin],
    [guest, alice],
  ] as const;

  test.each(allow)("%o &o", (user, parent) => {
    expect(() => auth.User.name(user, parent.id)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, parent) => {
    expect(() => auth.User.name(user, parent.id)).toThrow(AuthErr);
  });
});

describe("User.email", () => {
  const allow = [
    [admin, admin],
    [admin, alice],
    [alice, alice],
  ] as const;

  const deny = [
    [alice, admin],
    [guest, admin],
    [guest, alice],
  ] as const;

  test.each(allow)("%o &o", (user, parent) => {
    expect(() => auth.User.email(user, parent.id)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, parent) => {
    expect(() => auth.User.email(user, parent.id)).toThrow(AuthErr);
  });
});

describe("User.token", () => {
  const allow = [
    [admin, admin],
    [alice, alice],
    [guest, guest],
  ] as const;

  const deny = [
    [admin, alice],
    [alice, admin],
    [guest, admin],
    [guest, alice],
  ] as const;

  test.each(allow)("%o &o", (user, parent) => {
    expect(() => auth.User.token(user, parent.id)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, parent) => {
    expect(() => auth.User.token(user, parent.id)).toThrow(AuthErr);
  });
});

import { describe, test, expect } from "vitest";

import { admin, alice, guest } from "tests/data/context";
import { adminTodo1 as adminTodo, aliceTodo } from "tests/data/db";
import { AuthorizationError as AuthErr } from "../common/authorizers";
import { authorizers as auth } from "./authorizers";

describe("Mutation.createTodo", () => {
  const allow = [admin, alice];

  const deny = [guest];

  test.each(allow)("%o", user => {
    expect(() => auth.Mutation.createTodo(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o", user => {
    expect(() => auth.Mutation.createTodo(user)).toThrow(AuthErr);
  });
});

describe("Mutation.updateTodo", () => {
  const allow = [admin, alice];

  const deny = [guest];

  test.each(allow)("%o", user => {
    expect(() => auth.Mutation.updateTodo(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o", user => {
    expect(() => auth.Mutation.updateTodo(user)).toThrow(AuthErr);
  });
});

describe("Mutation.deleteTodo", () => {
  const allow = [admin, alice];

  const deny = [guest];

  test.each(allow)("%o", user => {
    expect(() => auth.Mutation.deleteTodo(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o", user => {
    expect(() => auth.Mutation.deleteTodo(user)).toThrow(AuthErr);
  });
});

describe("Mutation.completeTodo", () => {
  const allow = [admin, alice];

  const deny = [guest];

  test.each(allow)("%o", user => {
    expect(() => auth.Mutation.completeTodo(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o", user => {
    expect(() => auth.Mutation.completeTodo(user)).toThrow(AuthErr);
  });
});

describe("Mutation.uncompleteTodo", () => {
  const allow = [admin, alice];

  const deny = [guest];

  test.each(allow)("%o", user => {
    expect(() => auth.Mutation.uncompleteTodo(user)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o", user => {
    expect(() => auth.Mutation.uncompleteTodo(user)).toThrow(AuthErr);
  });
});

describe("Todo.id", () => {
  const allow = [
    [admin, adminTodo],
    [admin, aliceTodo],
    [alice, aliceTodo],
  ] as const;

  const deny = [
    [alice, adminTodo],
    [guest, adminTodo],
    [guest, aliceTodo],
  ] as const;

  test.each(allow)("%o %o", (user, todo) => {
    expect(() => auth.Todo.id(user, todo)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, todo) => {
    expect(() => auth.Todo.id(user, todo)).toThrow(AuthErr);
  });
});

describe("Todo.createdAt", () => {
  const allow = [
    [admin, adminTodo],
    [admin, aliceTodo],
    [alice, aliceTodo],
  ] as const;

  const deny = [
    [alice, adminTodo],
    [guest, adminTodo],
    [guest, aliceTodo],
  ] as const;

  test.each(allow)("%o %o", (user, todo) => {
    expect(() => auth.Todo.createdAt(user, todo)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, todo) => {
    expect(() => auth.Todo.createdAt(user, todo)).toThrow(AuthErr);
  });
});

describe("Todo.updatedAt", () => {
  const allow = [
    [admin, adminTodo],
    [admin, aliceTodo],
    [alice, aliceTodo],
  ] as const;

  const deny = [
    [alice, adminTodo],
    [guest, adminTodo],
    [guest, aliceTodo],
  ] as const;

  test.each(allow)("%o %o", (user, todo) => {
    expect(() => auth.Todo.updatedAt(user, todo)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, todo) => {
    expect(() => auth.Todo.updatedAt(user, todo)).toThrow(AuthErr);
  });
});

describe("Todo.title", () => {
  const allow = [
    [admin, adminTodo],
    [alice, aliceTodo],
  ] as const;

  const deny = [
    [admin, aliceTodo],
    [alice, adminTodo],
    [guest, adminTodo],
    [guest, aliceTodo],
  ] as const;

  test.each(allow)("%o %o", (user, todo) => {
    expect(() => auth.Todo.title(user, todo)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, todo) => {
    expect(() => auth.Todo.title(user, todo)).toThrow(AuthErr);
  });
});

describe("Todo.description", () => {
  const allow = [
    [admin, adminTodo],
    [alice, aliceTodo],
  ] as const;

  const deny = [
    [admin, aliceTodo],
    [alice, adminTodo],
    [guest, adminTodo],
    [guest, aliceTodo],
  ] as const;

  test.each(allow)("%o %o", (user, todo) => {
    expect(() => auth.Todo.description(user, todo)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, todo) => {
    expect(() => auth.Todo.description(user, todo)).toThrow(AuthErr);
  });
});

describe("Todo.status", () => {
  const allow = [
    [admin, adminTodo],
    [alice, aliceTodo],
  ] as const;

  const deny = [
    [admin, aliceTodo],
    [alice, adminTodo],
    [guest, adminTodo],
    [guest, aliceTodo],
  ] as const;

  test.each(allow)("%o %o", (user, todo) => {
    expect(() => auth.Todo.status(user, todo)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, todo) => {
    expect(() => auth.Todo.status(user, todo)).toThrow(AuthErr);
  });
});

describe("Todo.user", () => {
  const allow = [
    [admin, adminTodo],
    [admin, aliceTodo],
    [alice, aliceTodo],
  ] as const;

  const deny = [
    [alice, adminTodo],
    [guest, adminTodo],
    [guest, aliceTodo],
  ] as const;

  test.each(allow)("%o %o", (user, todo) => {
    expect(() => auth.Todo.user(user, todo)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, todo) => {
    expect(() => auth.Todo.user(user, todo)).toThrow(AuthErr);
  });
});

describe("User.todo", () => {
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

  test.each(allow)("%o %o", (user, parent) => {
    expect(() => auth.User.todo(user, parent.id)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, parent) => {
    expect(() => auth.User.todo(user, parent.id)).toThrow(AuthErr);
  });
});

describe("User.todos", () => {
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

  test.each(allow)("%o %o", (user, parent) => {
    expect(() => auth.User.todos(user, parent.id)).not.toThrow(AuthErr);
  });

  test.each(deny)("%o %o", (user, parent) => {
    expect(() => auth.User.todos(user, parent.id)).toThrow(AuthErr);
  });
});

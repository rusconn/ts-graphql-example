import { inputRule } from "graphql-shield";

const todos = inputRule()(
  yup =>
    yup.object({
      option: yup
        .object({
          first: yup.number().integer().max(50),
        })
        .optional()
        .nullable(),
    }),
  {
    abortEarly: false,
  }
);

const createTodo = inputRule()(
  yup =>
    yup.object({
      input: yup.object({
        title: yup.string().max(100),
        description: yup.string().max(5000),
      }),
    }),
  {
    abortEarly: false,
  }
);

const updateTodo = inputRule()(
  yup =>
    yup.object({
      input: yup.object({
        title: yup.string().max(100),
        description: yup.string().max(5000),
      }),
    }),
  {
    abortEarly: false,
  }
);

export const validations = {
  Query: {
    todos,
  },
  Mutation: {
    createTodo,
    updateTodo,
  },
};

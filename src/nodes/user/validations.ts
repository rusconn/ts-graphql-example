import { inputRule } from "graphql-shield";

const users = inputRule()(
  yup =>
    yup.object({
      option: yup
        .object({
          first: yup.number().integer().max(30),
        })
        .optional()
        .nullable(),
    }),
  {
    abortEarly: false,
  }
);

const createUser = inputRule()(
  yup =>
    yup.object({
      input: yup.object({
        name: yup.string().max(100),
      }),
    }),
  {
    abortEarly: false,
  }
);

const updateUser = inputRule()(
  yup =>
    yup.object({
      input: yup.object({
        name: yup.string().max(100),
      }),
    }),
  {
    abortEarly: false,
  }
);

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

export const validations = {
  Query: {
    users,
  },
  Mutation: {
    createUser,
    updateUser,
  },
  User: {
    todos,
  },
};

/* eslint-disable */

import { Prisma } from "@prisma/client";

import { DataSourceError, InputTooLongError, NotFoundError } from "./errors";

/** メソッドが投げる Prisma のエラーを dataSources 一般 のエラーでラップする */
export const catchPrismaError = (
  _target: unknown,
  _propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const method = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    try {
      return await method.apply(this, args);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case "P2000":
            throw new InputTooLongError(e);
          case "P2001":
          case "P2025":
            throw new NotFoundError(e);
          default:
            throw new DataSourceError(e);
        }
      }

      throw e;
    }
  };
};

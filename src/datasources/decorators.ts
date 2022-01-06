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
        if (e.code === "P2000") {
          throw new InputTooLongError(e);
        }

        if (e.code === "P2001" || e.code === "P2025") {
          throw new NotFoundError(e);
        }

        throw new DataSourceError(e);
      }

      throw e;
    }
  };
};

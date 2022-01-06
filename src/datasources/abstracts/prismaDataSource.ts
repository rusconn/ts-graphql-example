import type { PrismaClient } from "@prisma/client";

import { CustomDataSource } from "./customDataSource";

export abstract class PrismaDataSource extends CustomDataSource {
  constructor(protected prisma: PrismaClient) {
    super();
  }
}

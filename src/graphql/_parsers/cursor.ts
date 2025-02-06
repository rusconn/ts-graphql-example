import { z } from "zod";

export const cursorSchema = <T>(isCursor: (x: unknown) => x is T) =>
  z.string().refine((s) => isCursor(s), { message: "Malformed cursor" });

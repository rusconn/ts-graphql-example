import { TodoAPI, UserAPI } from "@/datasources";
import { prisma } from "./prisma";

export const todoAPI = new TodoAPI(prisma);
export const userAPI = new UserAPI(prisma);

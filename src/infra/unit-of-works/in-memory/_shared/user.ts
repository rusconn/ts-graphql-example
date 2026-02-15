import type { User as Domain } from "../../../../domain/entities.ts";
import { emailAlreadyExistsError } from "../../../../domain/unit-of-works/_errors/email-already-exists.ts";
import { entityNotFoundError } from "../../../../domain/unit-of-works/_errors/entity-not-found.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import { toDb } from "../../db/_shared/user.ts";

export class UserRepoShared {
  #trx;
  #tenantId;

  constructor(trx: InMemoryDb, tenantId?: Domain.Type["id"]) {
    this.#trx = trx;
    this.#tenantId = tenantId;
  }

  async add(user: Domain.Type) {
    if (this.#tenantId != null && user.id !== this.#tenantId) {
      throw new Error("forbidden");
    }

    const db = toDb(user);

    if (this.#trx.users.values().find(({ email }) => email === db.user.email)) {
      throw emailAlreadyExistsError();
    }

    if (this.#trx.users.get(db.user.id)) {
      throw new Error(`conflict: users: ${db.user.id}`);
    } else if (this.#trx.credentials.get(db.credential.userId)) {
      throw new Error(`conflict: credentials: ${db.credential.userId}`);
    } else {
      this.#trx.users.set(db.user.id, db.user);
      this.#trx.credentials.set(db.credential.userId, db.credential);
    }
  }

  async update(user: Domain.Type) {
    const db = toDb(user);

    if (this.#trx.users.values().find(({ email }) => email === db.user.email)) {
      throw emailAlreadyExistsError();
    }

    const gotUser = this.#trx.users.get(db.user.id);
    if (!gotUser) {
      throw entityNotFoundError();
    }

    const gotCredential = this.#trx.credentials.get(db.credential.userId);
    if (!gotCredential) {
      throw entityNotFoundError();
    }

    if (this.#tenantId != null && user.id !== this.#tenantId) {
      throw entityNotFoundError();
    }

    this.#trx.users.set(db.user.id, db.user);
    this.#trx.credentials.set(db.credential.userId, db.credential);
  }

  async remove(id: Domain.Type["id"]) {
    const user = this.#trx.users.get(id);
    if (!user) {
      throw entityNotFoundError();
    }

    const credential = this.#trx.credentials.get(id);
    if (!credential) {
      throw entityNotFoundError();
    }

    this.#trx.users.delete(id);
    this.#trx.credentials.delete(id);
  }
}

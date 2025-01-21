import { pickDefined } from "../../lib/object/pickDefined.ts";
import type { MutationResolvers, MutationUserProfileEditArgs } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { USER_AVATAR_MAX, parseUserAvatar } from "../_parsers/user/avatar.ts";
import { USER_BIO_MAX, parseUserBio } from "../_parsers/user/bio.ts";
import { USER_HANDLE_MAX, parseUserHandle } from "../_parsers/user/handle.ts";
import { USER_LOCATION_MAX, parseUserLocation } from "../_parsers/user/location.ts";
import { USER_WEBSITE_MAX, parseUserWebsite } from "../_parsers/user/website.ts";
import { ParseErr, invalidInputErrors } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userProfileEdit(
      """
      ${USER_AVATAR_MAX}文字まで
      """
      avatar: URL

      """
      ${USER_HANDLE_MAX}文字まで、null は入力エラー
      """
      handle: String

      """
      ${USER_BIO_MAX}文字まで、null は入力エラー
      """
      bio: String

      """
      ${USER_LOCATION_MAX}文字まで、null は入力エラー
      """
      location: String

      """
      ${USER_WEBSITE_MAX}文字まで、null は入力エラー
      """
      website: URL
    ): UserProfileEditResult @semanticNonNull
  }

  union UserProfileEditResult = UserProfileEditSuccess | InvalidInputErrors

  type UserProfileEditSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["userProfileEdit"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseArgs(args);

  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const result = await context.api.user.updateById(authed.id, parsed);

  switch (result.type) {
    case "Success":
      return {
        __typename: "UserProfileEditSuccess",
        user: result.user,
      };
    case "NameAlreadyExists":
    case "EmailAlreadyExists":
      throw new Error("unreachable");
    case "Unknown":
      throw internalServerError(result.e);
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: MutationUserProfileEditArgs) => {
  const avatar = parseUserAvatar(args.avatar, "avatar", {
    optional: true,
    nullable: true,
  });
  const handle = parseUserHandle(args.handle, "handle", {
    optional: true,
    nullable: false,
  });
  const bio = parseUserBio(args.bio, "bio", {
    optional: true,
    nullable: false,
  });
  const location = parseUserLocation(args.location, "location", {
    optional: true,
    nullable: false,
  });
  const website = parseUserWebsite(args.website, "website", {
    optional: true,
    nullable: false,
  });

  if (
    avatar instanceof ParseErr ||
    handle instanceof ParseErr ||
    bio instanceof ParseErr ||
    location instanceof ParseErr ||
    website instanceof ParseErr
  ) {
    const errors = [];

    if (avatar instanceof Error) {
      errors.push(avatar);
    }
    if (handle instanceof Error) {
      errors.push(handle);
    }
    if (bio instanceof Error) {
      errors.push(bio);
    }
    if (location instanceof Error) {
      errors.push(location);
    }
    if (website instanceof Error) {
      errors.push(website);
    }

    return errors;
  } else {
    return pickDefined({ avatar, handle, bio, location, website });
  }
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    type URL = Exclude<MutationUserProfileEditArgs["avatar"], undefined>;

    const validArgs: MutationUserProfileEditArgs = {
      avatar: "https://example.com/avatar/1" as URL,
      handle: "exmaple",
      bio: "exmaple",
      location: "exmaple",
      website: "https://example.com/website/1" as URL,
    };

    const valids: MutationUserProfileEditArgs[] = [
      { ...validArgs },
      { ...validArgs, avatar: null },
      { ...validArgs, avatar: "a".repeat(USER_AVATAR_MAX) as URL },
      { ...validArgs, handle: "a".repeat(USER_HANDLE_MAX) },
      { ...validArgs, bio: "a".repeat(USER_BIO_MAX) },
      { ...validArgs, location: "a".repeat(USER_LOCATION_MAX) },
      { ...validArgs, website: "a".repeat(USER_WEBSITE_MAX) as URL },
    ];

    const invalids: [MutationUserProfileEditArgs, (keyof MutationUserProfileEditArgs)[]][] = [
      [{ ...validArgs, handle: null }, ["handle"]],
      [{ ...validArgs, bio: null }, ["bio"]],
      [{ ...validArgs, location: null }, ["location"]],
      [{ ...validArgs, website: null }, ["website"]],
      [{ ...validArgs, avatar: "a".repeat(USER_AVATAR_MAX + 1) as URL }, ["avatar"]],
      [{ ...validArgs, handle: "a".repeat(USER_HANDLE_MAX + 1) }, ["handle"]],
      [{ ...validArgs, bio: "a".repeat(USER_BIO_MAX + 1) }, ["bio"]],
      [{ ...validArgs, location: "a".repeat(USER_LOCATION_MAX + 1) }, ["location"]],
      [{ ...validArgs, website: "a".repeat(USER_WEBSITE_MAX + 1) as URL }, ["website"]],
      [{ ...validArgs, handle: null, bio: null, location: null }, ["handle", "bio", "location"]],
    ];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(Array.isArray(parsed)).toBe(false);
    });

    test.each(invalids)("invalids %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(Array.isArray(parsed)).toBe(true);
      expect((parsed as ParseErr[]).map((e) => e.field)).toStrictEqual(fields);
    });
  });
}

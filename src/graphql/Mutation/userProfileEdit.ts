import type { MutationResolvers, MutationUserProfileEditArgs } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { USER_AVATAR_MAX, parseUserAvatar } from "../_parsers/user/avatar.ts";
import { USER_BIO_MAX, parseUserBio } from "../_parsers/user/bio.ts";
import { USER_HANDLE_MAX, parseUserHandle } from "../_parsers/user/handle.ts";
import { USER_LOCATION_MAX, parseUserLocation } from "../_parsers/user/location.ts";
import { USER_WEBSITE_MAX, parseUserWebsite } from "../_parsers/user/website.ts";

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
      handle: NonEmptyString

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
    ): UserProfileEditResult
  }

  union UserProfileEditResult = UserProfileEditSuccess | InvalidInputError

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

  if (parsed instanceof Error) {
    return {
      __typename: "InvalidInputError",
      message: parsed.message,
    };
  }

  const edited = await context.api.user.updateById(authed.id, parsed);

  if (!edited) {
    throw internalServerError();
  }

  return {
    __typename: "UserProfileEditSuccess",
    user: edited,
  };
};

const parseArgs = (args: MutationUserProfileEditArgs) => {
  const avatar = parseUserAvatar(args, {
    optional: true,
    nullable: true,
  });

  if (avatar instanceof Error) {
    return avatar;
  }

  const handle = parseUserHandle(args, {
    optional: true,
    nullable: false,
  });

  if (handle instanceof Error) {
    return handle;
  }

  const bio = parseUserBio(args, {
    optional: true,
    nullable: false,
  });

  if (bio instanceof Error) {
    return bio;
  }

  const location = parseUserLocation(args, {
    optional: true,
    nullable: false,
  });

  if (location instanceof Error) {
    return location;
  }

  const website = parseUserWebsite(args, {
    optional: true,
    nullable: false,
  });

  if (website instanceof Error) {
    return website;
  }

  return { avatar, handle, bio, location, website };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const validArgs = {
      avatar: "https://example.com/avatar/1",
      handle: "exmaple",
      bio: "exmaple",
      location: "exmaple",
      website: "https://example.com/website/1",
    };

    const valids = [
      { ...validArgs },
      { ...validArgs, avatar: null },
      { ...validArgs, avatar: "a".repeat(USER_AVATAR_MAX) },
      { ...validArgs, handle: "a".repeat(USER_HANDLE_MAX) },
      { ...validArgs, bio: "a".repeat(USER_BIO_MAX) },
      { ...validArgs, location: "a".repeat(USER_LOCATION_MAX) },
      { ...validArgs, website: "a".repeat(USER_WEBSITE_MAX) },
    ] as MutationUserProfileEditArgs[];

    const invalids = [
      { ...validArgs, handle: null },
      { ...validArgs, bio: null },
      { ...validArgs, location: null },
      { ...validArgs, website: null },
      { ...validArgs, avatar: "a".repeat(USER_AVATAR_MAX + 1) },
      { ...validArgs, handle: "a".repeat(USER_HANDLE_MAX + 1) },
      { ...validArgs, bio: "a".repeat(USER_BIO_MAX + 1) },
      { ...validArgs, location: "a".repeat(USER_LOCATION_MAX + 1) },
      { ...validArgs, website: "a".repeat(USER_WEBSITE_MAX + 1) },
    ] as MutationUserProfileEditArgs[];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed instanceof Error).toBe(true);
    });
  });
}

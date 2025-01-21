import type { UserFull } from "../../../models/user.ts";

export const db = {
  alice: {
    /** Date: 2024-12-15T17:41:37.938Z */
    id: "0193cb69-5412-759b-a780-8de48a4c054d",
    updatedAt: new Date("2024-12-15T17:41:58.591Z"),
    avatar: "https://example.com/avatars/alice",
    name: "alice",
    handle: "Alice",
    bio: "CS -> programmer",
    location: "U.S.",
    website: "https://example.com/websites/alice",
    email: "alice@example.com",
    /** raw: alicealice */
    password: "$2b$04$vox810wl680PtUOq1CPTL.lMhjWYsjFqVIMOmzrMIXKvqTh/XZ5Gy",
    token: "0193cb69-740b-7589-9e85-34d9cece28fe",
  } as UserFull,
  bob: {
    /** Date: 2024-12-15T17:41:58.590Z */
    id: "0193cb69-a4be-754e-a5a0-462df1202f5e",
    updatedAt: new Date("2024-12-15T17:41:58.590Z"),
    avatar: "https://example.com/avatars/bob",
    name: "bob",
    handle: "SuperBob",
    bio: "plumber -> firefighter",
    location: "earth",
    website: "https://example.com/websites/bob",
    email: "bob@example.com",
    /** raw: bobbob */
    password: "$2b$04$9IEd9DQdN7oS7Vv8Vc7B3ONEOnK.f6cbNEs14MUDcYBMclIpLh/Ki",
    token: "0193cb69-c86c-747c-82b4-85506f4a592f",
  } as UserFull,
};

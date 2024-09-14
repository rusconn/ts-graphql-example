import { UserRole } from "@/db/types.ts";

export const db = {
  admin: {
    /** Date: 2023-08-06T12:21:21.040Z */
    id: "01H75CPZGG1YW9W79M7WWT6KFB",
    updatedAt: new Date("2023-08-06T12:21:23.000Z"),
    name: "Admin",
    email: "admin@admin.com",
    /** raw: adminadmin */
    password: "$2b$04$aIswdZ6eFo8qQTheMa8x1.s2sd7I9uZr.vUkGwl9OylshNLCMqH8i",
    role: UserRole.ADMIN,
    token: "01H77AB3NYGD7B1N3XRPKD8JTN",
  },
  alice: {
    /** Date: 2023-08-06T12:21:21.378Z */
    id: "01H75CPZV2VWQPCXTBKXCQ50A2",
    updatedAt: new Date("2023-08-06T12:21:21.378Z"),
    name: "Alice",
    email: "alice@alice.com",
    /** raw: alicealice */
    password: "$2b$04$vox810wl680PtUOq1CPTL.lMhjWYsjFqVIMOmzrMIXKvqTh/XZ5Gy",
    role: UserRole.USER,
    token: "01H77ABA8TDGSQ2XJVV57A0BEV",
  },
} as const;

import * as DataSource from "@/datasources";

export const admin: DataSource.User = {
  id: "a4kxogX92Wxe-kbUfDRX7",
  createdAt: new Date(0),
  updatedAt: new Date(3),
  name: "Admin",
  email: "admin@admin.com",
  /** raw: adminadmin */
  password: "$2b$10$363AzXaBAp3xwf/1c85mJeCH.l3BorYjEFXywOtUT8t8IOvkaLQfO",
  role: DataSource.Role.ADMIN,
  token: "admin token",
} as const;

export const alice: DataSource.User = {
  id: "bYzHPCFPTkTPHNbCBkh8H",
  createdAt: new Date(1),
  updatedAt: new Date(1),
  name: "Alice",
  email: "alice@alice.com",
  /** raw: alicealice */
  password: "$2b$10$nhNLSR99rprKOT3pvIeiqOW.U.YPBiXXM7.vMxILjl.ywDc9RUTqq",
  role: DataSource.Role.USER,
  token: "alice token",
} as const;

export const bob: DataSource.User = {
  id: "cuEgH4iyoMMm6CzhWLR9S",
  createdAt: new Date(2),
  updatedAt: new Date(2),
  name: "Bob",
  email: "bob@bob.com",
  /** raw: bobbobbob */
  password: "$2b$10$6zDRVDvyLcIfbfphxKlx2eln4vmewOitItQpJlCEyGothvnFPkev.",
  role: DataSource.Role.USER,
  token: "bob token",
} as const;

export const adminTodo1: DataSource.Todo = {
  id: "aHbtLGE7ANe1CSDbnhZQZ",
  createdAt: new Date(1),
  updatedAt: new Date(6),
  title: "admin todo 1",
  description: "admin todo 1",
  status: DataSource.TodoStatus.PENDING,
  userId: admin.id,
} as const;

export const adminTodo2: DataSource.Todo = {
  id: "bJKfvOLA7kyPS1DE5qngJ",
  createdAt: new Date(2),
  updatedAt: new Date(2),
  title: "admin todo 2",
  description: "admin todo 2",
  status: DataSource.TodoStatus.PENDING,
  userId: admin.id,
} as const;

export const adminTodo3: DataSource.Todo = {
  id: "c6ppdu7LgOwAPMUtAQpmW",
  createdAt: new Date(3),
  updatedAt: new Date(3),
  title: "admin todo 3",
  description: "admin todo 3",
  status: DataSource.TodoStatus.PENDING,
  userId: admin.id,
} as const;

export const aliceTodo: DataSource.Todo = {
  id: "dL1raaT3gqDLeP8CSkX5N",
  createdAt: new Date(4),
  updatedAt: new Date(4),
  title: "alice todo",
  description: "alice todo 1",
  status: DataSource.TodoStatus.PENDING,
  userId: alice.id,
} as const;

export const bobTodo: DataSource.Todo = {
  id: "enXlHLmZgwGeu9v0TNrFP",
  createdAt: new Date(5),
  updatedAt: new Date(5),
  title: "bob todo",
  description: "bob todo 1",
  status: DataSource.TodoStatus.PENDING,
  userId: bob.id,
} as const;

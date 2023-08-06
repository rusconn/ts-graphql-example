import * as DataSource from "@/datasources";

export const admin: DataSource.User = {
  id: "01H75CPZGG1YW9W79M7WWT6KFB",
  createdAt: new Date(0),
  updatedAt: new Date(3),
  name: "Admin",
  email: "admin@admin.com",
  /** raw: adminadmin */
  password: "$2b$10$363AzXaBAp3xwf/1c85mJeCH.l3BorYjEFXywOtUT8t8IOvkaLQfO",
  role: DataSource.Role.ADMIN,
  token: "01H77AB3NYGD7B1N3XRPKD8JTN",
} as const;

export const alice: DataSource.User = {
  id: "01H75CPZV2VWQPCXTBKXCQ50A2",
  createdAt: new Date(1),
  updatedAt: new Date(1),
  name: "Alice",
  email: "alice@alice.com",
  /** raw: alicealice */
  password: "$2b$10$nhNLSR99rprKOT3pvIeiqOW.U.YPBiXXM7.vMxILjl.ywDc9RUTqq",
  role: DataSource.Role.USER,
  token: "01H77ABA8TDGSQ2XJVV57A0BEV",
} as const;

export const bob: DataSource.User = {
  id: "01H75CQ03ENCE1YTVCN4V9BN1V",
  createdAt: new Date(2),
  updatedAt: new Date(2),
  name: "Bob",
  email: "bob@bob.com",
  /** raw: bobbobbob */
  password: "$2b$10$6zDRVDvyLcIfbfphxKlx2eln4vmewOitItQpJlCEyGothvnFPkev.",
  role: DataSource.Role.USER,
  token: "01H77ABFHH0GMQ6CZAXXEGGP2Z",
} as const;

export const adminTodo1: DataSource.Todo = {
  id: "01H75CR8C6PQK7Z7RE4FBY1B4M",
  createdAt: new Date(1),
  updatedAt: new Date(6),
  title: "admin todo 1",
  description: "admin todo 1",
  status: DataSource.TodoStatus.PENDING,
  userId: admin.id,
} as const;

export const adminTodo2: DataSource.Todo = {
  id: "01H75CRPCXACS8MDZFF1N5G7R9",
  createdAt: new Date(2),
  updatedAt: new Date(2),
  title: "admin todo 2",
  description: "admin todo 2",
  status: DataSource.TodoStatus.PENDING,
  userId: admin.id,
} as const;

export const adminTodo3: DataSource.Todo = {
  id: "01H75CRXV5EEDKJ731969B25TM",
  createdAt: new Date(3),
  updatedAt: new Date(3),
  title: "admin todo 3",
  description: "admin todo 3",
  status: DataSource.TodoStatus.PENDING,
  userId: admin.id,
} as const;

export const aliceTodo: DataSource.Todo = {
  id: "01H75CS32JKXAK95KMDCA3PV1Z",
  createdAt: new Date(4),
  updatedAt: new Date(4),
  title: "alice todo",
  description: "alice todo 1",
  status: DataSource.TodoStatus.PENDING,
  userId: alice.id,
} as const;

export const bobTodo: DataSource.Todo = {
  id: "01H75CS8ANSAVT8A15AM5ZXC9Y",
  createdAt: new Date(5),
  updatedAt: new Date(5),
  title: "bob todo",
  description: "bob todo 1",
  status: DataSource.TodoStatus.PENDING,
  userId: bob.id,
} as const;

import { Role, TodoAPI, User, UserAPI } from "@/datasources";

const todoAPI = new TodoAPI();
const userAPI = new UserAPI();

const main = async () => {
  const users = await createUsers();
  await createTodos(users.map(({ id }) => id));
};

const createUsers = () => {
  const params = [
    { name: "admin", role: Role.ADMIN },
    { name: "hoge", role: Role.USER },
    { name: "piyo", role: Role.USER },
    { name: "fuga", role: Role.USER },
  ];

  const creates = params.map(data => userAPI.create(data));

  return Promise.all(creates);
};

const createTodos = ([_adminId, userId1, userId2, _userId3]: User["id"][]) => {
  const params = [
    { title: "hoge todo 1", description: "hoge desc 1", userId: userId1 },
    { title: "piyo todo 1", description: "piyo desc 1", userId: userId2 },
    { title: "piyo todo 2", description: "piyo desc 2", userId: userId2 },
  ];

  const creates = params.map(data => todoAPI.create(data));

  return Promise.all(creates);
};

main().catch(console.error);

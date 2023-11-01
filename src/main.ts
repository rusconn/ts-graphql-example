import { port } from "./config";
import { server } from "./server";

server.listen(port, () => {
  console.info(`Server is running on http://localhost:${port}/graphql`);
});

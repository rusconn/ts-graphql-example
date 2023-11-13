import { port } from "./config.js";
import { server } from "./server.js";

server.listen(port, () => {
  console.info(`Server is running on http://localhost:${port}/graphql`);
});

if (import.meta.hot) {
  import.meta.hot.on("vite:beforeFullReload", () => {
    server.close();
  });
}

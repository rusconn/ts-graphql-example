import { port } from "./config.ts";
import { server } from "./server.ts";

server.listen(port, () => {
  console.info(`Server is running on http://localhost:${port}/graphql`);
});

if (import.meta.hot) {
  import.meta.hot.on("vite:beforeFullReload", () => {
    server.close();
  });
}

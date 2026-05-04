import http from "node:http";

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:3000${path}`, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(5000, () => req.destroy(new Error("timeout")));
  });
}

const stores = await get("/seed/stores");
const users = await get("/seed/users");
const todos = await get("/seed/todos");
const stats = await get("/seed/stats");

console.log(`stores.length = ${stores.data.length}, first = ${stores.data[0].shop_name}`);
console.log(
  `stores[0].__mock = ${stores.data[0].__mock}, __source = ${stores.data[0].__source}`
);
console.log(`users.list.length = ${users.data.list.length}, first = ${users.data.list[0].user_name}`);
console.log(
  `users.list[0].__mock = ${users.data.list[0].__mock}, __source = ${users.data.list[0].__source}`
);
console.log(`todos.length = ${todos.data.length}, first = ${todos.data[0].title}`);
console.log(`todos[0].__mock = ${todos.data[0].__mock}, __source = ${todos.data[0].__source}`);
console.log(`stats:`, JSON.stringify(stats.data));

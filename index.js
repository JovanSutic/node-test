const http = require("http");
const url = require("url");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function parsePath(path) {
  const result = {};
  const split = path.split("/");
  let index = 0;
  const terminology = [
    "primary",
    "secondary",
    "tertiary",
    "quatre",
    "additional",
  ];

  split.forEach((item) => {
    if (item) {
      result[terminology[index]] = item;
      index++;
    }
  });

  return result;
}

const server = http.createServer(async (req, res) => {
  const p = url.parse(req.url);
  const { primary, secondary } = parsePath(p.pathname);

  if (primary === "users") {
    if (req.method === "GET") {
      if (secondary) {
        try {
          const user = await prisma.users.findUnique({
            where: { id: parseInt(secondary) },
          });

          if (user) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(user)); // Send user data as JSON
          } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end(`User with ID ${secondary} not found`);
          }
        } catch (error) {
          console.log(error);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(`Error fetching user: ${error.message}`);
        }
      } else {
        try {
          const users = await prisma.users.findMany();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(users));
        } catch (error) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(`Error fetching users: ${error.message}`);
        }
      }
    } else if (req.method === "PUT") {
      let body = "";

      // Collect the request body in chunks
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        // After all chunks are received, parse the body (assuming it's JSON)
        try {
          const parsedBody = JSON.parse(body);

          if (!parsedBody.name || parsedBody.name.trim().length < 2) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end(`Error: Invalid body, you should send a name`);
          } else {
            const user = await prisma.users.create({
              data: {
                name: parsedBody.name,
              },
            });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                message: "Data created successfully",
                data: user,
              })
            );
          }

          // Respond to the client
        } catch (err) {
          // If there's an error parsing the JSON, respond with an error
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });

      req.on("error", (err) => {
        // Handle any error during the request
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Internal Server Error",
            details: err.message,
          })
        );
      });
    } else {
      res.writeHead(404); // Not Found
      res.end(`404 - ${req.method} Method for user Path Not Found`);
    }
  } else if (primary === "cities") {
    if (req.method === "GET") {
      if (secondary) {
        try {
          const city = await prisma.cities.findUnique({
            where: { id: parseInt(secondary) },
          });

          if (city) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(city)); // Send user data as JSON
          } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end(`User with ID ${secondary} not found`);
          }
        } catch (error) {
          console.log(error);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(`Error fetching city: ${error.message}`);
        }
      } else {
        try {
          const cities = await prisma.cities.findMany();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(cities));
        } catch (error) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(`Error fetching cities: ${error.message}`);
        }
      }
    } else if (req.method === "PUT") {
      let body = "";

      // Collect the request body in chunks
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        // After all chunks are received, parse the body (assuming it's JSON)
        try {
          const parsedBody = JSON.parse(body);

          if (!parsedBody.name || parsedBody.name.trim().length < 2 || !parsedBody.country || parsedBody.country.trim().length < 2) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end(`Error: Invalid body, you should send a name and a country`);
          } else {
            const city = await prisma.cities.create({
              data: {
                name: parsedBody.name,
                country: parsedBody.country,
              },
            });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                message: "Data created successfully",
                data: city,
              })
            );
          }

          // Respond to the client
        } catch (err) {
          // If there's an error parsing the JSON, respond with an error
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });

      req.on("error", (err) => {
        // Handle any error during the request
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Internal Server Error",
            details: err.message,
          })
        );
      });
    } else {
      res.writeHead(404); // Not Found
      res.end(`404 - ${req.method} Method for user Path Not Found`);
    }
  } else {
    res.writeHead(404); // Not Found
    res.end("404 - Path Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

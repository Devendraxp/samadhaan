const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Samadhaan Api",
      version: "0.1.0",
      description: "This project for hostel complaint management",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Devendra",
        email: "dhuvandevendra@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

export { swaggerOptions };

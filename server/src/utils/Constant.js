const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Samadhaan API",
      version: "0.1.0",
      description:
        "Hostel complaint management APIs. When invoking endpoints from the web client, append `?source=web` so the backend can issue HTTP-only cookies for authentication.",
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
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste the JWT returned from /auth/login. Most protected endpoints require this authorization header.",
        },
      },
      parameters: {
        SourceQuery: {
          in: "query",
          name: "source",
          schema: {
            type: "string",
            enum: ["web"],
          },
          required: false,
          description:
            "Append ?source=web when calling from browser-based clients to ensure cookies/token flows behave correctly.",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", nullable: true },
            email: { type: "string", format: "email" },
            role: { type: "string" },
            status: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Complaint: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            subject: { type: "string" },
            description: { type: "string" },
            domain: { type: "string" },
            status: { type: "string" },
            anonymous: { type: "boolean" },
            mediaLink: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            complainer: { $ref: "#/components/schemas/User" },
          },
        },
        CreateComplaintInput: {
          type: "object",
          required: ["subject", "description", "domain"],
          properties: {
            subject: { type: "string" },
            description: { type: "string" },
            domain: { type: "string" },
            mediaLink: { type: "string" },
            anonymous: { type: "boolean" },
          },
        },
        UpdateComplaintInput: {
          type: "object",
          properties: {
            subject: { type: "string" },
            description: { type: "string" },
            domain: { type: "string" },
            status: { type: "string" },
            anonymous: { type: "boolean" },
            mediaLink: { type: "string" },
          },
        },
        Response: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            content: { type: "string" },
            mediaLink: { type: "string", nullable: true },
            isVisible: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            responder: { $ref: "#/components/schemas/User" },
          },
        },
        CreateResponseInput: {
          type: "object",
          required: ["complaintId", "content"],
          properties: {
            complaintId: { type: "string", format: "uuid" },
            content: { type: "string" },
            mediaLink: { type: "string" },
            isVisible: { type: "boolean" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string" },
            type: { type: "string" },
            domain: { type: "string", nullable: true },
            mediaLink: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            createdBy: { $ref: "#/components/schemas/User" },
          },
        },
        CreateNotificationInput: {
          type: "object",
          required: ["title", "description", "type"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            type: { type: "string" },
            domain: { type: "string" },
            mediaLink: { type: "string" },
          },
        },
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

export { swaggerOptions };

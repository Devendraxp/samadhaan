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
        url: "https://hostel-samadhaan.onrender.com/",
      },
      {
        url: "http://localhost:3000/",
      }
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
        PageQuery: {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            minimum: 1,
            default: 1,
          },
          required: false,
          description: "Page number for pagination (default: 1)",
        },
        SizeQuery: {
          in: "query",
          name: "size",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 20,
            default: 10,
          },
          required: false,
          description: "Number of items per page (default: 10, max: 20)",
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
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            size: { type: "integer", example: 10 },
            total: { type: "integer", example: 45 },
            totalPages: { type: "integer", example: 5 },
            hasNext: { type: "boolean", example: true },
            hasPrev: { type: "boolean", example: false },
          },
        },
        PaginatedUsers: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/User" },
            },
            pagination: { $ref: "#/components/schemas/Pagination" },
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
            responses: {
              type: "array",
              items: { $ref: "#/components/schemas/Response" },
            },
          },
        },
        PaginatedComplaints: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Complaint" },
            },
            pagination: { $ref: "#/components/schemas/Pagination" },
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
          example: {
            subject: "Low water pressure on fourth floor",
            description: "Residents from Block B2 report very low water pressure since last night. Please inspect the valves and pumps.",
            domain: "WATER",
            anonymous: false,
            mediaLink: "https://hostel-samadhaan.onrender.com/assets/sample-photo.jpg"
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
            updatedAt: { type: "string", format: "date-time" },
            complaintId: { type: "string", format: "uuid" },
            responderId: { type: "string", format: "uuid" },
            responder: { $ref: "#/components/schemas/User" },
          },
        },
        PaginatedResponses: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Response" },
            },
            pagination: { $ref: "#/components/schemas/Pagination" },
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
          example: {
            complaintId: "00000000-0000-0000-0000-000000000000",
            content: "Thanks — maintenance team will check the pump and revert by tomorrow evening.",
            isVisible: true
          },
        },
        UpdateResponseInput: {
          type: "object",
          properties: {
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
            userId: { type: "string", format: "uuid" },
          },
        },
        PaginatedNotifications: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Notification" },
            },
            pagination: { $ref: "#/components/schemas/Pagination" },
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
          example: {
            title: "Water shut down for maintenance",
            description: "Water supply will be suspended in Blocks A and B from 10:00 to 14:00 for scheduled maintenance.",
            type: "ALERT",
            domain: "WATER"
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
          example: {
            name: "Aman Verma",
            email: "student01@aurora-hostel.in",
            password: "Student@123"
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
          example: {
            email: "admin@samadhaan.in",
            password: "Admin@123"
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

export { swaggerOptions };

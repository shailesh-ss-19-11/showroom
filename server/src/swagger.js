const BikeInput = {
  type: "object",
  required: ["name", "brand", "category", "price"],
  properties: {
    name: { type: "string", example: "RV400" },
    brand: { type: "string", example: "Revolt" },
    category: { type: "string", example: "Sport" },
    price: { type: "number", example: 128900 },
    batteryCapacityKwh: { type: "number", nullable: true, example: 3.24 },
    rangeKm: { type: "number", nullable: true, example: 150 },
    chargingTimeHours: { type: "number", nullable: true, example: 4.5 },
    topSpeedKmph: { type: "number", nullable: true, example: 85 },
    power: { type: "string", nullable: true, example: "3 kW BLDC motor" },
    description: { type: "string", nullable: true },
    featured: { type: "boolean", default: false },
  },
};

const Bike = {
  allOf: [
    { type: "object", properties: { id: { type: "string" }, isActive: { type: "boolean" } } },
    BikeInput,
    {
      type: "object",
      properties: {
        colors: { type: "array", items: { $ref: "#/components/schemas/BikeColor" } },
        images: { type: "array", items: { $ref: "#/components/schemas/BikeImage" } },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  ],
};

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Revolt Motors API",
    version: "1.0.0",
    description:
      "REST API for the Revolt Motors bike showroom: public bike catalog/enquiries plus an admin-only management API.",
  },
  servers: [{ url: "/api", description: "API base path" }],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Bikes" },
    { name: "Upload" },
    { name: "Enquiries" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
      BikeInput,
      BikeColor: {
        type: "object",
        properties: {
          id: { type: "string" },
          bikeId: { type: "string" },
          name: { type: "string", example: "Racing Blue" },
          hexCode: { type: "string", example: "#1e3a8a" },
        },
      },
      BikeImage: {
        type: "object",
        properties: {
          id: { type: "string" },
          bikeId: { type: "string" },
          colorId: { type: "string", nullable: true },
          url: { type: "string", example: "http://localhost:5001/uploads/1699999999-abc123.jpg" },
          isPrimary: { type: "boolean" },
        },
      },
      Bike,
      Enquiry: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", nullable: true },
          message: { type: "string", nullable: true },
          bikeId: { type: "string", nullable: true },
          source: { type: "string", example: "contact" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      EnquiryInput: {
        type: "object",
        required: ["name", "phone"],
        properties: {
          name: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", nullable: true },
          message: { type: "string", nullable: true },
          bikeId: { type: "string", nullable: true },
          source: { type: "string", nullable: true, example: "contact" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: { type: "string", example: "admin" },
          password: { type: "string", format: "password", example: "Admin@123" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          admin: {
            type: "object",
            properties: {
              username: { type: "string" },
            },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "API and database health check",
        responses: {
          200: { description: "Service healthy" },
          503: { description: "Database unreachable" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Admin login",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } },
        },
        responses: {
          200: {
            description: "Login successful",
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } },
          },
          401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the current admin from the JWT",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Current admin payload" },
          401: { description: "Missing or invalid token" },
        },
      },
    },
    "/bikes": {
      get: {
        tags: ["Bikes"],
        summary: "List bikes",
        parameters: [
          { name: "brand", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "featured", in: "query", schema: { type: "boolean" } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["price_asc", "price_desc"] } },
        ],
        responses: {
          200: {
            description: "List of bikes",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Bike" } } } },
          },
        },
      },
      post: {
        tags: ["Bikes"],
        summary: "Create a bike",
        description:
          "Accepts either a JSON body, or multipart/form-data with the same fields as plain text " +
          "plus an `images` field (2 or more files) to upload and attach photos in the same request. " +
          "The first uploaded image is marked as the primary photo. Use the JSON form when you only " +
          "need bike details, and add photos afterwards via POST /bikes/{id}/images.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/BikeInput" } },
            "multipart/form-data": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/BikeInput" },
                  {
                    type: "object",
                    properties: {
                      images: {
                        type: "array",
                        items: { type: "string", format: "binary" },
                        description: "Two or more photo files (JPEG/PNG/WEBP/AVIF, max 5MB each)",
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: {
          201: { description: "Bike created", content: { "application/json": { schema: { $ref: "#/components/schemas/Bike" } } } },
          400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          401: { description: "Missing or invalid token" },
        },
      },
    },
    "/bikes/meta": {
      get: {
        tags: ["Bikes"],
        summary: "Get distinct brands and categories for filters",
        responses: { 200: { description: "Brands and categories" } },
      },
    },
    "/bikes/{id}": {
      get: {
        tags: ["Bikes"],
        summary: "Get a single bike",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Bike", content: { "application/json": { schema: { $ref: "#/components/schemas/Bike" } } } },
          404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Bikes"],
        summary: "Update a bike",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "application/json": { schema: { $ref: "#/components/schemas/BikeInput" } } },
        },
        responses: {
          200: { description: "Updated bike", content: { "application/json": { schema: { $ref: "#/components/schemas/Bike" } } } },
          401: { description: "Missing or invalid token" },
          404: { description: "Not found" },
        },
      },
      delete: {
        tags: ["Bikes"],
        summary: "Delete a bike",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Deleted" },
          401: { description: "Missing or invalid token" },
          404: { description: "Not found" },
        },
      },
    },
    "/bikes/{id}/colors": {
      post: {
        tags: ["Bikes"],
        summary: "Add a color variant to a bike",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "hexCode"],
                properties: { name: { type: "string" }, hexCode: { type: "string" } },
              },
            },
          },
        },
        responses: {
          201: { description: "Color created", content: { "application/json": { schema: { $ref: "#/components/schemas/BikeColor" } } } },
          400: { description: "Validation error" },
          401: { description: "Missing or invalid token" },
        },
      },
    },
    "/bikes/{id}/colors/{colorId}": {
      delete: {
        tags: ["Bikes"],
        summary: "Remove a color variant",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "colorId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          204: { description: "Deleted" },
          401: { description: "Missing or invalid token" },
          404: { description: "Not found" },
        },
      },
    },
    "/bikes/{id}/images": {
      post: {
        tags: ["Bikes"],
        summary: "Attach an uploaded photo to a bike",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["url"],
                properties: {
                  url: { type: "string", example: "http://localhost:5001/uploads/1699999999-abc123.jpg" },
                  colorId: { type: "string", nullable: true },
                  isPrimary: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Image attached", content: { "application/json": { schema: { $ref: "#/components/schemas/BikeImage" } } } },
          400: { description: "Validation error" },
          401: { description: "Missing or invalid token" },
        },
      },
    },
    "/bikes/{id}/images/{imageId}": {
      delete: {
        tags: ["Bikes"],
        summary: "Remove a photo",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "imageId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          204: { description: "Deleted" },
          401: { description: "Missing or invalid token" },
          404: { description: "Not found" },
        },
      },
    },
    "/upload": {
      post: {
        tags: ["Upload"],
        summary: "Upload an image file (JPEG/PNG/WEBP/AVIF, max 5MB)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: { image: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Uploaded",
            content: {
              "application/json": {
                schema: { type: "object", properties: { url: { type: "string" } } },
              },
            },
          },
          400: { description: "No file or invalid type" },
          401: { description: "Missing or invalid token" },
        },
      },
    },
    "/enquiries": {
      get: {
        tags: ["Enquiries"],
        summary: "List customer enquiries",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "bikeId", in: "query", schema: { type: "string" }, description: "Filter to enquiries for one bike" },
        ],
        responses: {
          200: {
            description: "List of enquiries",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Enquiry" } } } },
          },
          401: { description: "Missing or invalid token" },
        },
      },
      post: {
        tags: ["Enquiries"],
        summary: "Submit a customer enquiry (public — contact form / bike detail / WhatsApp fallback)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/EnquiryInput" } } },
        },
        responses: {
          201: { description: "Enquiry created", content: { "application/json": { schema: { $ref: "#/components/schemas/Enquiry" } } } },
          400: { description: "Validation error" },
        },
      },
    },
    "/enquiries/{id}": {
      delete: {
        tags: ["Enquiries"],
        summary: "Delete an enquiry",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Deleted" },
          401: { description: "Missing or invalid token" },
          404: { description: "Not found" },
        },
      },
    },
  },
};

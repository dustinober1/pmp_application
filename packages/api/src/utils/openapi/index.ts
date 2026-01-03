import type { OpenAPIV3_1 } from "openapi-types";

/**
 * Convert a Zod schema to OpenAPI schema (stub for future use)
 */
export function zodToOpenAPISchema(
  zodSchema: any,
  description?: string,
): OpenAPIV3_1.SchemaObject {
  const jsonSchema: any = zodSchema;

  if (description) {
    jsonSchema.description = description;
  }

  return jsonSchema;
}

/**
 * Create a reference object
 */
export function ref(
  component: "schemas" | "responses" | "parameters",
  name: string,
): OpenAPIV3_1.ReferenceObject {
  return {
    $ref: `#/components/${component}/${name}`,
  };
}

/**
 * Generate examples from schema
 */
export function generateExample(schema: any): any {
  if (schema.example) {
    return schema.example;
  }

  // Basic example generation based on type
  const example: any = {};

  if (schema.properties) {
    for (const [key, value] of Object.entries(schema.properties)) {
      const prop = value as any;
      if (prop.type === "string") {
        example[key] =
          prop.format === "email"
            ? "user@example.com"
            : prop.example || "string";
      } else if (prop.type === "number" || prop.type === "integer") {
        example[key] = prop.example || 0;
      } else if (prop.type === "boolean") {
        example[key] = prop.example || true;
      } else if (prop.type === "array") {
        example[key] = prop.example || [];
      } else if (prop.enum) {
        example[key] = prop.enum[0];
      }
    }
  }

  return example;
}

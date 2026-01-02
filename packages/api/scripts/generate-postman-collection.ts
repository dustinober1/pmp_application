/**
 * Generate Postman collection from OpenAPI spec
 * Usage: npm run generate:postman
 */

import fs from 'fs';
import path from 'path';
import { generateOpenAPISpec } from '../dist/utils/openapi/generate-spec';

const __dirname = path.dirname(__filename);

interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    schema: string;
  };
  item: any[];
  variable?: any[];
}

function generatePostmanCollection(openAPISpec: any): PostmanCollection {
  const baseUrl = openAPISpec.servers?.[0]?.url || 'http://localhost:4000';

  const collection: PostmanCollection = {
    info: {
      name: openAPISpec.info.title,
      description: openAPISpec.info.description,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [],
    variable: [
      {
        key: 'baseUrl',
        value: baseUrl,
        type: 'string',
      },
      {
        key: 'token',
        value: '',
        type: 'string',
        description: 'JWT authentication token',
      },
    ],
  };

  // Group by tags
  const tagGroups: Record<string, any[]> = {};

  for (const [path, pathSpec] of Object.entries(openAPISpec.paths)) {
    for (const [method, operationSpec] of Object.entries(pathSpec)) {
      const operation = operationSpec as any;

      // Get tag (use first tag or 'General')
      const tag = operation.tags?.[0] || 'General';

      if (!tagGroups[tag]) {
        tagGroups[tag] = [];
      }

      // Build request
      const request: any = {
        name: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
        request: {
          method: method.toUpperCase(),
          header: [
            {
              key: 'Content-Type',
              value: 'application/json',
            },
          ],
          url: {
            raw: `{{baseUrl}}${path}`,
            host: ['{{baseUrl}}'],
            path: path.split('/').filter(Boolean),
          },
          description: operation.description,
        },
      };

      // Add authentication if required
      if (operation.security?.length > 0) {
        request.request.header.push({
          key: 'Authorization',
          value: 'Bearer {{token}}',
          description: 'JWT authentication token',
        });
      }

      // Add query parameters
      if (operation.parameters) {
        request.request.url.query = [];
        for (const param of operation.parameters) {
          if ((param as any).in === 'query') {
            request.request.url.query.push({
              key: (param as any).name,
              value: (param as any).schema?.example || '',
              description: (param as any).description,
            });
          }
        }
      }

      // Add path parameters
      if (operation.parameters) {
        for (const param of operation.parameters) {
          if ((param as any).in === 'path') {
            const pathVar = (param as any).name;
            request.request.url.path = request.request.url.path.map((segment: string) =>
              segment === `:${pathVar}` ? `:${pathVar}` : segment
            );
          }
        }
      }

      // Add request body
      if (operation.requestBody) {
        const content = operation.requestBody.content?.['application/json'];
        if (content?.schema) {
          request.request.body = {
            mode: 'raw',
            raw: JSON.stringify(generateExampleFromSchema(content.schema), null, 2),
            options: {
              raw: {
                language: 'json',
              },
            },
          };
        }
      }

      tagGroups[tag].push(request);
    }
  }

  // Convert tag groups to folders
  for (const [tag, items] of Object.entries(tagGroups)) {
    collection.item.push({
      name: tag,
      item: items,
    });
  }

  return collection;
}

function generateExampleFromSchema(schema: any): any {
  if (schema.example) {
    return schema.example;
  }

  if (schema.properties) {
    const example: any = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      const prop = value as any;
      if (prop.type === 'string') {
        example[key] = prop.format === 'email' ? 'user@example.com' : prop.example || 'string';
      } else if (prop.type === 'number' || prop.type === 'integer') {
        example[key] = prop.example || 0;
      } else if (prop.type === 'boolean') {
        example[key] = prop.example !== undefined ? prop.example : true;
      } else if (prop.type === 'array') {
        example[key] = prop.example || [];
      } else if (prop.enum) {
        example[key] = prop.enum[0];
      }
    }
    return example;
  }

  return {};
}

// Generate collection
const openAPISpec = generateOpenAPISpec();
const postmanCollection = generatePostmanCollection(openAPISpec);

// Output directory
const outputDir = path.join(__dirname, '..', 'openapi');
const collectionPath = path.join(outputDir, 'postman-collection.json');

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write collection
fs.writeFileSync(collectionPath, JSON.stringify(postmanCollection, null, 2), 'utf-8');
console.log(`✅ Postman collection exported to: ${collectionPath}`);
console.log(`📊 Total requests: ${postmanCollection.item.reduce((acc, folder) => acc + folder.item.length, 0)}`);
console.log(`📁 Total folders: ${postmanCollection.item.length}`);

/**
 * Export OpenAPI specification to JSON and YAML files
 * Usage: npm run export:openapi
 */

import fs from "fs";
import path from "path";
import * as yaml from "yamljs";
import { generateOpenAPISpec } from "../dist/utils/openapi/generate-spec";

const __dirname = path.dirname(__filename);

// Generate OpenAPI spec
const openAPISpec = generateOpenAPISpec();

// Output directory
const outputDir = path.join(__dirname, "..", "openapi");
const jsonPath = path.join(outputDir, "openapi.json");
const yamlPath = path.join(outputDir, "openapi.yaml");

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write JSON spec
fs.writeFileSync(jsonPath, JSON.stringify(openAPISpec, null, 2), "utf-8");
console.log(`✅ OpenAPI JSON spec exported to: ${jsonPath}`);

// Write YAML spec
fs.writeFileSync(yamlPath, yaml.stringify(openAPISpec, 10), "utf-8");
console.log(`✅ OpenAPI YAML spec exported to: ${yamlPath}`);

// Print summary
console.log("\n📊 OpenAPI Specification Summary:");
console.log(`   Title: ${openAPISpec.info.title}`);
console.log(`   Version: ${openAPISpec.info.version}`);
console.log(`   Total Endpoints: ${Object.keys(openAPISpec.paths).length}`);
console.log(`   Tags: ${openAPISpec.tags.map((t: any) => t.name).join(", ")}`);

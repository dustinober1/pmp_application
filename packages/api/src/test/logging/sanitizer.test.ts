/**
 * Sanitizer unit tests
 */

import {
  sanitize,
  createSanitizationRules,
  isSensitiveField,
  redact,
} from "../../logging/sanitizer";

describe("sanitize", () => {
  it("should sanitize password fields", () => {
    const obj = {
      username: "john",
      password: "secret123",
      email: "john@example.com",
    };

    const sanitized = sanitize(obj);

    expect(sanitized.username).toBe("john");
    expect(sanitized.password).toBe("*********");
    expect(sanitized.email).toBe("john@example.com");
  });

  it("should sanitize nested objects", () => {
    const obj = {
      user: {
        username: "john",
        password: "secret123",
      },
      metadata: {
        apiKey: "key123",
      },
    };

    const sanitized = sanitize(obj);

    expect(sanitized.user.username).toBe("john");
    expect(sanitized.user.password).toBe("*********");
    expect(sanitized.metadata.apiKey).toBe("******");
  });

  it("should sanitize arrays", () => {
    const obj = {
      users: [
        { username: "john", password: "pass1" },
        { username: "jane", password: "pass2" },
      ],
    };

    const sanitized = sanitize(obj);

    expect(sanitized.users[0].username).toBe("john");
    expect(sanitized.users[0].password).toBe("*****");
    expect(sanitized.users[1].username).toBe("jane");
    expect(sanitized.users[1].password).toBe("*****");
  });

  it("should handle null and undefined", () => {
    expect(sanitize(null)).toBeNull();
    expect(sanitize(undefined)).toBeUndefined();
  });

  it("should handle primitive types", () => {
    expect(sanitize("string")).toBe("string");
    expect(sanitize(123)).toBe(123);
    expect(sanitize(true)).toBe(true);
  });
});

describe("createSanitizationRules", () => {
  it("should create custom sanitization rules", () => {
    const fields = ["customField1", "customField2"];
    const rules = createSanitizationRules(fields, "[HIDDEN]");

    expect(rules).toHaveLength(2);
    expect(rules[0].field).toBe("customField1");
    expect(rules[0].replacement).toBe("[HIDDEN]");
  });
});

describe("isSensitiveField", () => {
  it("should identify password as sensitive", () => {
    expect(isSensitiveField("password")).toBe(true);
    expect(isSensitiveField("user_password")).toBe(true);
    expect(isSensitiveField("Password")).toBe(true);
  });

  it("should identify token as sensitive", () => {
    expect(isSensitiveField("token")).toBe(true);
    expect(isSensitiveField("accessToken")).toBe(true);
    expect(isSensitiveField("refresh_token")).toBe(true);
  });

  it("should identify apiKey as sensitive", () => {
    expect(isSensitiveField("apiKey")).toBe(true);
    expect(isSensitiveField("api_key")).toBe(true);
    expect(isSensitiveField("x-api-key")).toBe(true);
  });

  it("should not identify non-sensitive fields", () => {
    expect(isSensitiveField("username")).toBe(false);
    expect(isSensitiveField("email")).toBe(false);
    expect(isSensitiveField("name")).toBe(false);
  });

  it("should handle custom sensitive fields", () => {
    const customFields = ["customSecret", "privateData"];
    expect(isSensitiveField("customSecret", customFields)).toBe(true);
    expect(isSensitiveField("privateData", customFields)).toBe(true);
    expect(isSensitiveField("username", customFields)).toBe(false);
  });
});

describe("redact", () => {
  it("should redact password field value", () => {
    const redacted = redact("password", "secret123");
    expect(redacted).toBe("*********");
  });

  it("should redact token field value", () => {
    const redacted = redact("token", "abc123xyz");
    expect(redacted).toBe("*********");
  });

  it("should not redact non-sensitive field", () => {
    const redacted = redact("username", "john");
    expect(redacted).toBe("john");
  });

  it("should handle numbers", () => {
    const redacted = redact("password", 12345);
    expect(redacted).toBe("[REDACTED]");
  });

  it("should handle booleans", () => {
    const redacted = redact("password", true);
    expect(redacted).toBe("[REDACTED]");
  });
});

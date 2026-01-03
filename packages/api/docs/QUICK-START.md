# OpenAPI Documentation - Quick Start Guide

## 🚀 Quick Start

### 1. View Documentation (Development)

```bash
cd packages/api
npm run dev
# Open: http://localhost:4000/api-docs
```

### 2. Export OpenAPI Spec

```bash
cd packages/api
npm run export:openapi
# Output: openapi/openapi.json & openapi/openapi.yaml
```

### 3. Generate Postman Collection

```bash
cd packages/api
npm run generate:postman
# Output: openapi/postman-collection.json
```

### 4. Export Everything

```bash
cd packages/api
npm run docs:export
# Generates both OpenAPI spec and Postman collection
```

## 📚 Authentication

### Get JWT Token

1. Go to `/api-docs`
2. Find `POST /api/auth/login`
3. Click "Try it out"
4. Enter credentials
5. Execute
6. Copy `data.user.id` as token

### Use Token in Swagger

1. Click "Authorize" button (🔒)
2. Enter: `Bearer <your-jwt-token>`
3. Click "Authorize"
4. All requests now authenticated

## 🧪 Testing Endpoints

### Example: Create User

1. Find `POST /api/auth/register`
2. Click "Try it out"
3. Fill in body:
   ```json
   {
     "email": "test@example.com",
     "password": "Password123",
     "name": "Test User"
   }
   ```
4. Click "Execute"
5. View response

## 📁 Generated Files

```
packages/api/openapi/
├── openapi.json              # OpenAPI 3.1 spec (JSON)
├── openapi.yaml              # OpenAPI 3.1 spec (YAML)
└── postman-collection.json   # Postman collection
```

## 🔧 Common Tasks

### Add New Endpoint Documentation

1. Create route handler
2. Add to appropriate generator file in `src/utils/openapi/generators/`
3. Import in `generate-spec.ts`
4. Run `npm run export:openapi`

### Validate OpenAPI Spec

```bash
npx -p @apidevtools/swagger-cli swagger-cli validate openapi/openapi.json
```

### View Spec Changes

```bash
git diff openapi/openapi.json
```

## 🐛 Troubleshooting

### Swagger UI Shows 404

- Check `NODE_ENV` is not 'production'
- Verify middleware is registered in `src/index.ts`

### Spec Out of Date

```bash
npm run build
npm run export:openapi
```

### Build Errors

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📖 Full Documentation

See `/docs/api-documentation.md` for comprehensive guide.

## 🆘 Support

- GitHub Issues: Tag with `api-documentation`
- Email: api-support@pmpstudy.com

---

**Version:** 1.0.0
**Last Updated:** January 2026

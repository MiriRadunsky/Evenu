# AI Agent Instructions for Events Project

This document provides essential context for AI agents working in this codebase.

## Project Overview

Events is an event management platform tailored for the Haredi (Ultra-Orthodox Jewish) community. It facilitates event planning, vendor discovery, real-time communication, and payment tracking, with cultural sensitivity built into its core design.

## Architecture & Key Components

### Core Architecture
- **Backend Stack**: Node.js/Express + MongoDB + Socket.IO
- **API Design**: RESTful with real-time WebSocket integration
- **Authentication**: JWT-based (`utils/token.js`)

### Critical Service Boundaries
1. **Authentication & User Management**
   - User types: admin, client, supplier (`models/user.model.js`)
   - Role-based access control (`middlewares/role.middleware.js`)

2. **Real-time Communication**
   - WebSocket implementation in `sockets/message.gateway.js`
   - Thread-based messaging system (`models/thread.model.js`)
   - Time-To-Live (TTL) for chat messages

3. **Business Logic Layer**
   - Repository pattern for data access (`repositories/`)
   - Service layer for business rules (`services/`)
   - Controllers for request handling (`controllers/`)

## Key Development Patterns

### Request Flow Pattern
```
Route → Validation → Controller → Service → Repository → Model
```
Example in `routes/request.route.js` → `controllers/request.controller.js` → `services/request.service.js`

### Error Handling
- Async operations wrapped with `asyncHandler.middleware.js`
- Centralized error handling in `error.middleware.js`
- Validation using Joi schemas (`validation/`)

### Data Access Pattern
- Repository pattern isolates database operations
- Models define schemas and business rules
- Example: `suppliers.repository.js` for vendor-related operations

## Development Workflow

### Local Development
```bash
# Start MongoDB (required before server)
# Start the server in dev mode with hot reload
npm run dev
```

### Key File Locations
- API Routes: `server/routes/`
- Business Logic: `server/services/`
- Data Models: `server/models/`
- WebSocket Logic: `server/sockets/`

## Integration Points
1. **Socket.IO Integration**
   - Real-time messaging handled in `message.gateway.js`
   - Client connections managed through Socket.IO events

2. **External Services**
   - MongoDB connection configured in `db/config.db.js`
   - Environment variables loaded via `dotenv`

## Common Tasks & Conventions
- Always use the repository pattern for database operations
- Implement validation schemas in `validation/` directory
- Handle async operations with the `asyncHandler` middleware
- Follow the established service boundary pattern for new features
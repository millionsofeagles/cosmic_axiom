# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cosmic Axiom is a penetration testing report writing platform built with a microservices architecture. It enables security professionals to create, manage, and export professional penetration testing reports.

## Architecture

### Microservices
- **astral** (port 3001): Authentication and authorization service using JWT
- **forge** (port 3002): Client and engagement management
- **library** (port 3003): Finding template storage and management
- **singularity** (port 3004): Report creation and management
- **satellite** (port 3005): API gateway that orchestrates requests to other services
- **horizon** (port 3006): Document generation service (PDF/DOCX export)

### Frontend
- React + Vite + TailwindCSS
- Runs on port 5173
- Uses React Router for navigation
- Dark mode support

### Database
- MySQL with Prisma ORM
- Each microservice has its own database: `astral`, `library`, `forge`, `singularity`
- JWT tokens stored in RSA key files under `src/keys/` in each service

## Essential Commands

### Initial Setup
```bash
# Start infrastructure and seed databases
cd infra
./standup.sh
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev      # Start dev server (port 5173)
npm run build    # Production build
npm run lint     # Run ESLint
```

### Backend Service Development
For any service (astral, forge, library, singularity, satellite, horizon):
```bash
cd services/<service-name>
npm install
npm run dev                    # Start with nodemon
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Deploy database migrations
```

### Running All Services
```bash
# From project root, start each service in separate terminals
cd services/astral && npm run dev
cd services/forge && npm run dev
cd services/library && npm run dev
cd services/singularity && npm run dev
cd services/satellite && npm run dev
cd services/horizon && npm run dev
```

## Authentication Flow

1. All requests go through `satellite` service
2. JWT tokens are verified using RSA keys stored in each service's `src/keys/` directory
3. Middleware stack: `authenticateRequest` → `authorizeRoles`
4. Token contains: userId, email, name, roles

## Key API Patterns

### Service Communication
- Satellite forwards requests to appropriate microservices
- Internal service URLs: `http://localhost:<port>`
- All services use consistent error handling and response formats

### Common Middleware
```javascript
authenticateRequest  // Verifies JWT token
authorizeRoles       // Checks user permissions
```

### Database Operations
- Use Prisma for all database operations
- Transactions for multi-step operations
- Consistent error handling with try-catch blocks

## Testing & Development

### Default Credentials
- Admin: admin@cosmic.com / admin123
- User: user@cosmic.com / user123

### Report Generation Flow
1. Create customer in forge
2. Create engagement for customer
3. Create report in singularity
4. Add findings from library templates
5. Generate document via horizon

### Common Issues
- Ensure all services are running before testing
- Check JWT keys exist in `src/keys/` directories
- Verify database connections in docker-compose
- Frontend API calls go to satellite on port 3005
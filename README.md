# Penetration Testing Report Writer – Microservice Architecture

> A scalable, microservice-based system for writing, managing, and exporting penetration testing reports.  
> Built for operational clarity in a universe of digital chaos.

## Overview

This platform simplifies the penetration testing reporting workflow by breaking it into focused, containerized microservices.  
Each service owns a distinct part of the system, making it modular, easy to maintain, and extensible over time.

## Architecture Summary

### Microservices
| Service Name | Purpose |
|--------------|---------|
| **singularity** | Create, edit, and manage structured penetration testing reports. |
| **satellite** | Create, edit, and manage structured penetration testing reports. |
| **library** | Store reusable finding templates (CVE entries, standard text). |
| **forge** | Manage client details, project scopes, and engagement metadata. |
| **horizon** | Generate formatted PDFs or Word documents from report data. |
| **astral** | Handle user authentication and role-based access control. |

## Core Features
- **Microservice Communication:** RESTful APIs (HTTP/JSON)
- **Authentication:** JWT-based user authentication and role authorization
- **Report Versioning:** Track edits and maintain historical versions
- **Finding Library:** Insert standardized findings into reports
- **Export Templates:** Customizable report templates (PDF/DOCX output)
- **Evidence Attachments:** Upload screenshots, logs, etc.
- **Role Management:** Admins, Analysts, Reviewers, Clients

## Tech Stack

| Layer | Technology Choices |
|------|---------------------|
| Frontend | React.js + TailwindCSS |
| API Gateway | Express.js |
| Microservices | Node.js (Fastify or Express) |
| Database | MySQL + Prisma ORM |
| Authentication | JWT (future: optional OAuth2) |
| PDF/Document Generation | Puppeteer / Docx.js |
| Containerization | Docker (Docker Compose for Dev) |
| CI/CD (optional later) | GitHub Actions / DockerHub |

## Project Layout
```
cosmic_axiom/
├── frontend/                        # React frontend app
├── api-gateway/                     # API gateway routing to microservices
├── services/
│   ├── singularity/                  
│   ├── library/                      
│   ├── forge/                        
│   ├── horizon/                      
│   └── astral/                       
├── shared/                          # Shared libraries 
├── docker-compose.yml               # Dev Docker orchestration
├── README.md                         # (You are here)
└── LICENSE                           # Optional open source license
```

## Key Concepts

- **Domain-Driven Services:** Each service has its own Prisma models and manages its own slice of the database.
- **Stateless APIs:** Services do not store session state internally.
- **Prisma for DB Access:** Fast, type-safe access to MySQL, easier schema migrations.
- **Simple Synchronous Communication:** No Kafka, no MQ — clean REST over HTTP.

## Development with Docker Compose

The development environment runs all services independently but networks them together via Docker Compose.

Example services:
- `mysql` (MySQL database)
- `api-gateway`
- `frontend`
- Individual microservices (`report-service`, etc.)

(See `docker-compose.yml` for full setup.)

## Future Enhancements

- AI-assisted writing (auto-suggesting text for findings or summaries)
- Burp/Nessus report importers
- Live collaboration in reports
- Organizational multitenancy (multiple clients per company)

# License

This project is licensed under the [MIT License](LICENSE).

# Summary

This platform brings structured, professional penetration testing reporting into a scalable, modern architecture — turning digital chaos into operational clarity.

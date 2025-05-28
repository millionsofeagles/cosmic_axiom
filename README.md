# 🛡️ Cosmic Axiom

> **Modern Penetration Testing Report Platform**  
> A scalable, AI-powered microservices platform for creating, managing, and exporting professional penetration testing reports.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Required-blue)](https://www.docker.com/)

---

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [💻 Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [📖 Usage](#-usage)
- [🛠️ Development](#️-development)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Features

### Core Functionality
- **📊 Modern Report Builder** - Intuitive drag-and-drop interface for creating professional pentest reports
- **🔍 Finding Library** - Extensive database of vulnerability templates and recommendations
- **🤖 AI-Powered Content** - Generate executive summaries, methodologies, and conclusions with AI assistance
- **📸 Evidence Management** - Upload, organize, and embed screenshots and proof-of-concept files
- **🎯 Scope Management** - Define and track engagement targets and testing boundaries
- **👥 Client Portal** - Dedicated client access for report viewing and collaboration

### Technical Features
- **🏗️ Microservices Architecture** - Modular, scalable design with independent services
- **🔐 Enterprise Authentication** - JWT-based auth with role-based access control
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **🌙 Dark Mode Support** - Built-in dark/light theme switching
- **📄 Multiple Export Formats** - Generate PDF and DOCX reports with custom templates
- **🔄 Real-time Collaboration** - Live editing and auto-save functionality

### Advanced Capabilities
- **📈 Analytics Dashboard** - Track findings, vulnerabilities, and engagement metrics
- **🔗 API Integration** - RESTful APIs for third-party tool integration
- **📦 Import/Export** - Support for Burp Suite, Nessus, and other scanning tools
- **🏢 Multi-tenant Support** - Isolated environments for different organizations
- **📋 Compliance Templates** - Pre-built templates for PCI DSS, SOC 2, and other frameworks

---

## 🏗️ Architecture

Cosmic Axiom follows a distributed microservices architecture, ensuring scalability, maintainability, and fault isolation.

### Service Overview

| Service | Port | Purpose | Technology |
|---------|------|---------|------------|
| **🌟 Astral** | 3001 | Authentication & User Management | Node.js + Prisma |
| **🔨 Forge** | 3002 | Customer & Engagement Management | Node.js + Prisma |
| **📚 Library** | 3003 | Finding Templates & Vulnerability DB | Node.js + Prisma |
| **🎯 Singularity** | 3004 | Report Creation & Management | Node.js + Prisma |
| **🛰️ Satellite** | 3005 | API Gateway & Request Routing | Node.js + Express |
| **🌅 Horizon** | 3006 | Document Generation (PDF/DOCX) | Node.js + Puppeteer |
| **☁️ Nebula** | 3007 | AI Content Generation | Node.js + Claude API |
| **🖥️ Frontend** | 5173 | React Web Application | React + Vite + TailwindCSS |

### Data Flow

```mermaid
graph TB
    A[Frontend] --> B[Satellite - API Gateway]
    B --> C[Astral - Auth]
    B --> D[Forge - Customers]
    B --> E[Library - Findings]
    B --> F[Singularity - Reports]
    B --> G[Horizon - Documents]
    B --> H[Nebula - AI]
    
    C --> I[(MySQL - astral)]
    D --> J[(MySQL - forge)]
    E --> K[(MySQL - library)]
    F --> L[(MySQL - singularity)]
```

---

## 🚀 Quick Start

Get up and running in minutes with our automated setup scripts:

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 18+](https://nodejs.org/)
- [OpenSSL](https://www.openssl.org/) (for key generation)

### Linux/macOS
```bash
# Clone the repository
git clone https://github.com/yourusername/cosmic_axiom.git
cd cosmic_axiom

# Run initial setup
cd infra
./standup.sh
cd ..

# Start all services
./start.sh
```

### Windows (PowerShell)
```powershell
# Clone the repository
git clone https://github.com/yourusername/cosmic_axiom.git
cd cosmic_axiom

# Run initial setup
cd infra
.\standup.ps1
cd ..

# Start all services
.\start.ps1
```

### Access the Application
- **Web Interface**: http://localhost:5173
- **Default Admin**: `admin@cosmic.com` / `admin123`
- **Default User**: `user@cosmic.com` / `user123`

---

## 💻 Installation

### Detailed Setup Instructions

#### 1. Clone and Navigate
```bash
git clone https://github.com/yourusername/cosmic_axiom.git
cd cosmic_axiom
```

#### 2. Infrastructure Setup
The setup script will:
- Start MySQL container
- Create databases for each microservice
- Generate RSA keys for JWT authentication
- Copy `.env.example` files to `.env` with unique secrets
- Install dependencies and run database migrations
- Seed initial data

```bash
cd infra
./standup.sh  # Linux/macOS
# OR
.\standup.ps1  # Windows PowerShell
```

#### 3. Configure Environment Variables
After running the setup script, review and update the `.env` files:

**Required Configuration:**
```bash
# Update the Claude API key for AI features (if using)
nano services/nebula/.env
# Change: CLAUDE_API_KEY=your_claude_api_key_here
# To: CLAUDE_API_KEY=your_actual_api_key
```

**Optional Configurations:**
- Database connection strings (if using external MySQL)
- Service ports (if you have conflicts)
- Logging levels and other service-specific settings

#### 4. Start Services
The start script provides:
- Color-coded console output for each service
- Automatic dependency installation
- Port conflict resolution
- Process health monitoring
- Clean shutdown handling

```bash
./start.sh  # Linux/macOS
# OR
.\start.ps1  # Windows PowerShell
```

---

## 🔧 Configuration

### Environment Variables

Each service includes a `.env.example` file that gets copied to `.env` during setup. The setup process automatically generates unique JWT secrets for each service.

#### Manual Configuration Required

**Nebula (AI Service) - Optional but Recommended:**
```bash
# Edit services/nebula/.env
CLAUDE_API_KEY=your_actual_claude_api_key_here  # Get from https://console.anthropic.com/
```

#### Pre-configured Services

**Database Services** (astral, forge, library, singularity):
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Auto-generated unique secret
- `PORT` - Service-specific port

**Satellite (API Gateway):**
- Microservice URLs pre-configured for local development
- `JWT_SECRET` - Auto-generated unique secret

**Horizon (Document Generation):**
- `JWT_SECRET` - Auto-generated unique secret
- Optional Puppeteer and storage configurations

**Frontend:**
- `VITE_SATELLITE_URL` - Points to local API gateway

### Customizing Configuration

To modify default settings:

1. **Copy and edit example files manually:**
   ```bash
   cp services/astral/.env.example services/astral/.env
   # Edit the .env file as needed
   ```

2. **Update database connections:**
   ```bash
   # In each service's .env file
   DATABASE_URL="mysql://user:password@host:port/database"
   ```

3. **Change service ports:**
   ```bash
   # In service .env files
   PORT=3001  # Change to available port
   ```

### Database Configuration

MySQL runs in Docker with the following default settings:
- **Host**: 127.0.0.1
- **Port**: 3306
- **User**: root
- **Password**: rootpassword

---

## 📖 Usage

### Creating Your First Report

1. **Login** to the application using the default credentials
2. **Create a Customer** in the Customers section
3. **Set up an Engagement** with testing scope and timeline
4. **Generate a Report** from the Reports section
5. **Add Findings** from the library or create custom ones
6. **Use AI Assistance** to generate executive summaries and conclusions
7. **Export** your report as PDF or DOCX

### Key Workflows

#### Customer Management
- Add customer information and contacts
- Track multiple engagements per customer
- Manage billing and contract details

#### Engagement Setup
- Define testing scope (IP ranges, domains, etc.)
- Set engagement timeline and constraints
- Configure testing methodology and tools

#### Report Writing
- Drag-and-drop finding organization
- Real-time collaborative editing
- Evidence attachment and management
- AI-powered content generation

#### Finding Library
- Browse pre-built vulnerability templates
- Create custom finding templates
- Tag and categorize findings by severity
- Import findings from scanning tools

---

## 🛠️ Development

### Project Structure
```
cosmic_axiom/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── layouts/         # Page layouts
│   │   └── assets/          # Static assets
│   └── package.json
├── services/                # Microservices
│   ├── astral/             # Authentication service
│   ├── forge/              # Customer management
│   ├── library/            # Finding templates
│   ├── singularity/        # Report management
│   ├── satellite/          # API gateway
│   ├── horizon/            # Document generation
│   └── nebula/             # AI integration
├── infra/                  # Infrastructure scripts
│   ├── docker-compose.local.yml
│   ├── standup.sh          # Setup script (Linux/macOS)
│   ├── standup.ps1         # Setup script (Windows)
│   └── seed_files/         # Database seed data
├── start.sh                # Service manager (Linux/macOS)
├── start.ps1               # Service manager (Windows)
└── README.md
```

### Development Commands

#### Individual Service Development
```bash
cd services/[service-name]
npm install
npm run dev
```

#### Database Operations
```bash
cd services/[service-name]
npx prisma generate        # Generate Prisma client
npx prisma migrate dev      # Create and apply migration
npx prisma studio          # Open database GUI
```

#### Frontend Development
```bash
cd frontend
npm install
npm run dev                 # Start dev server
npm run build              # Production build
npm run lint               # Run ESLint
```

### API Documentation

Each service exposes RESTful APIs. Key endpoints:

#### Authentication (Astral)
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /auth/verify` - Token verification

#### Reports (Singularity)
- `GET /reports` - List reports
- `POST /reports` - Create report
- `PUT /reports/:id` - Update report
- `DELETE /reports/:id` - Delete report

#### Findings (Library)
- `GET /findings` - List finding templates
- `POST /findings` - Create finding template
- `GET /findings/:id` - Get finding details

---

## 🤝 Contributing

We welcome contributions from the security community! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure code quality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write tests for new functionality
- Update documentation as needed
- Ensure all services start without errors
- Test cross-service communication

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include system information and logs
- Tag issues appropriately (bug, enhancement, etc.)

### Areas for Contribution
- 🔧 Additional scanning tool integrations
- 🎨 UI/UX improvements
- 🔒 Security enhancements
- 📊 Analytics and reporting features
- 🌐 Internationalization
- 📱 Mobile app development

---

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ **Commercial use** - Use in commercial projects
- ✅ **Modification** - Modify the source code
- ✅ **Distribution** - Distribute the software
- ✅ **Patent use** - Use any patents
- ✅ **Private use** - Use privately

**Requirements:**
- 📝 **License and copyright notice** - Include license in distributions
- 📝 **State changes** - Document changes made to the code
- 📝 **Disclose source** - Source code must be made available
- 📝 **Same license** - Derivatives must use the same license

---

## 🙏 Acknowledgments

- **Security Community** - For inspiration and best practices
- **Open Source Projects** - React, Node.js, Prisma, and countless others
- **Contributors** - Everyone who helps make this project better

---

<div align="center">

**[⬆ Back to Top](#-cosmic-axiom)**

Made with ❤️ by the security community

</div>
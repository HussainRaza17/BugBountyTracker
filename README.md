# Bug Bounty Tracker

A comprehensive platform for security researchers to log vulnerabilities, track their status, and analyze trends. Features role-based access control, vulnerability reporting, dashboards, and collaboration tools.

## Features

- **Authentication & User Management**: JWT-based auth with Researcher/Admin roles
- **Vulnerability Reporting**: Complete form with file uploads and CVSS scoring
- **Dashboards**: Separate views for researchers and admins with analytics
- **Comments & Collaboration**: Real-time commenting with @mentions
- **Notifications**: Email alerts for status changes
- **File Management**: Cloud storage for screenshots and PoCs

## Tech Stack

- **Frontend**: React 18 + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + bcrypt
- **File Storage**: Local storage (configurable for cloud)
- **Deployment**: Docker + Docker Compose

## Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd bug-bounty-tracker
   ```

2. **Start with Docker**:
   ```bash
   # On Windows
   start.bat
   
   # On Linux/Mac
   ./start.sh
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

4. **Demo Accounts**:
   - **Admin**: admin@bugbountytracker.com / admin123
   - **Researcher**: researcher@bugbountytracker.com / researcher123

### Option 2: Manual Setup

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Set up environment variables**:
   ```bash
   cp backend/env.example backend/.env
   # Edit backend/.env with your database credentials
   ```

3. **Set up PostgreSQL database**:
   - Install PostgreSQL
   - Create a database named `bugbountytracker`
   - Update the `DATABASE_URL` in `backend/.env`

4. **Set up the database**:
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the development servers**:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
bug-bounty-tracker/
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── prisma/
│   └── uploads/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   └── public/
└── docker-compose.yml
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Vulnerabilities
- `GET /api/vulnerabilities` - List vulnerabilities (with filters)
- `POST /api/vulnerabilities` - Create vulnerability
- `GET /api/vulnerabilities/:id` - Get vulnerability details
- `PUT /api/vulnerabilities/:id` - Update vulnerability
- `DELETE /api/vulnerabilities/:id` - Delete vulnerability

### Comments
- `GET /api/vulnerabilities/:id/comments` - Get comments
- `POST /api/vulnerabilities/:id/comments` - Add comment

## Environment Variables

Create `backend/.env` with:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/bugbountytracker"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

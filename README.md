# FRIS Webapp + Dolibarr Integration

Faculty Research Information System (FRIS) is a comprehensive web application that integrates with Dolibarr to manage faculty research profiles, publications, teaching activities, and more.

## Project Overview

This project implements a full-stack application with:

- **Backend**: Python FastAPI with PostgreSQL database
- **Frontend**: React-Vite with Material UI
- **Integration**: Dolibarr API for user management

## Features

- User authentication and role-based access control
- Faculty profile management
- Research activities tracking with SDG tagging
- Teaching activities and SET (Student Evaluation of Teaching) management
- Extension/Public Service tracking
- Authorship records
- Approval workflow for submissions
- Dolibarr integration for Third Party management

## Project Structure

```
fris-dolibarr/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── services/
│   │   │   └── dolibarr_client.py
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   ├── auth.py
│   │   └── utils.py
│   ├── requirements.txt
│   └── alembic/  # database migrations
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── .env
├── create_db.py
├── create_test_user.py
├── setup_project.bat
├── start_servers.bat
├── stop_servers.bat
└── README.md
```

## Setup Guide

### Prerequisites

- **Python 3.8+** - For the backend FastAPI server
- **PostgreSQL** - Database server
- **Node.js 16+** - For the frontend React application
- **Dolibarr instance** - With API access (for production)

### Quick Setup (Windows)

For a quick and automated setup on Windows:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fris-dolibarr.git
   cd fris-dolibarr
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql+psycopg2://postgres:$Qlbench3r20@localhost:5432/frisdb
   DOLIBARR_API_URL=https://wantwofrisky.with5.dolicloud.com/api/index.php
   DOLIBARR_API_KEY=CZefWiUPr47K38s0cw6BD0L0xwqrJG19
   SECRET_KEY=bXxdsZkrcRg5Xj948ea11g6KlPrkmFCr7DWli3_68uE
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ```

3. Run the setup script:
   ```
   setup_project.bat
   ```
   This script will:
   - Check for required prerequisites
   - Create a Python virtual environment
   - Install backend dependencies
   - Install frontend dependencies
   - Create the PostgreSQL database
   - Initialize database tables
   - Create test users

4. Start the application:
   ```
   start_servers.bat
   ```

5. To stop the application:
   ```
   stop_servers.bat
   ```

### Manual Setup

If you prefer to set up the project manually or are using a non-Windows system:

#### Environment Setup

1. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql+psycopg2://postgres:$Qlbench3r20@localhost:5432/frisdb
   DOLIBARR_API_URL=https://wantwofrisky.with5.dolicloud.com/api/index.php
   DOLIBARR_API_KEY=CZefWiUPr47K38s0cw6BD0L0xwqrJG19
   SECRET_KEY=bXxdsZkrcRg5Xj948ea11g6KlPrkmFCr7DWli3_68uE
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ```

#### Backend Setup

1. Create a Python virtual environment:
   ```
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

3. Create the database:
   ```
   python create_db.py
   ```

4. Create database tables:
   ```
   cd backend
   python -c "from app.models import Base; from sqlalchemy import create_engine; engine = create_engine('postgresql+psycopg2://postgres:$Qlbench3r20@localhost:5432/frisdb'); Base.metadata.create_all(bind=engine)"
   cd ..
   ```

5. Create test users:
   ```
   python create_test_user.py
   ```

6. Start the FastAPI server:
   ```
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

7. Access the API documentation at http://localhost:8000/docs

#### Frontend Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Access the frontend at http://localhost:5173

### Test Users

After setup, the following test users will be available:

- **Admin User**:
  - Email: admin@example.com
  - Password: admin123
  - Role: admin

- **Faculty User**:
  - Email: faculty@example.com
  - Password: faculty123
  - Role: faculty

- **Department Head**:
  - Email: head@example.com
  - Password: head123
  - Role: faculty (with department head privileges)

- **Dean User**:
  - Email: dean@example.com
  - Password: dean123
  - Role: faculty (with dean privileges)

## Development Tokens

For easier development and testing, the system accepts simplified authentication tokens:
- `dev_admin` - For admin access
- `dev_faculty` - For faculty access

## Database Schema

The application uses a comprehensive database schema with the following main entities:

- User (faculty profiles)
- Degree (educational background)
- ResearchInterest
- Affiliations
- ResearchExperience
- ResearchActivities (publications)
- CourseAndSET (teaching activities)
- Extension (public service)
- Authorship
- SDG (Sustainable Development Goals)
- ApprovalPath (workflow configuration)

## Dolibarr Integration

The application integrates with Dolibarr's Third Party module to manage faculty profiles. Key integration points:

- Faculty profiles are synced with Dolibarr Third Party entities
- User creation/updates trigger Dolibarr API calls
- Dolibarr Third Party IDs are stored in the User table

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

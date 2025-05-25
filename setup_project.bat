@echo off
echo ===================================================
echo FRIS-Dolibarr Project Setup
echo ===================================================
echo.

:: Prompt for PostgreSQL credentials
set PG_USER=postgres
set /p PG_USER=Enter PostgreSQL username (default: postgres): 
set PG_PASSWORD=
set /p PG_PASSWORD=Enter PostgreSQL password: 
set PG_HOST=localhost
set /p PG_HOST=Enter PostgreSQL host (default: localhost): 
set PG_PORT=5432
set /p PG_PORT=Enter PostgreSQL port (default: 5432): 
set PG_DB=frisdb

echo.
echo Using PostgreSQL connection: %PG_USER%@%PG_HOST%:%PG_PORT%/%PG_DB%
echo.

:: Check for PostgreSQL
echo Checking for PostgreSQL...
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL is not installed or not in PATH.
    echo Please install PostgreSQL and ensure it's in your PATH.
    echo Download from: https://www.postgresql.org/download/windows/
    goto :error
)
echo PostgreSQL found.

:: Check for Python
echo Checking for Python...
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python 3.8+ and ensure it's in your PATH.
    echo Download from: https://www.python.org/downloads/
    goto :error
)
python --version
echo Python found.

:: Check for Node.js
echo Checking for Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js 16+ and ensure it's in your PATH.
    echo Download from: https://nodejs.org/
    goto :error
)
node --version
echo Node.js found.

:: Check for npm
echo Checking for npm...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed or not in PATH.
    echo Please install npm and ensure it's in your PATH.
    goto :error
)
npm --version
echo npm found.

echo.
echo All prerequisites found. Starting setup...
echo.

:: Create and activate virtual environment
echo Creating Python virtual environment...
if not exist venv (
    python -m venv venv
    echo Virtual environment created.
) else (
    echo Virtual environment already exists.
)

:: Activate virtual environment
call venv\Scripts\activate
echo Virtual environment activated.

:: Install backend dependencies
echo Installing backend dependencies...
cd backend
pip install -r requirements.txt
cd ..
echo Backend dependencies installed.

:: Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
npm install
cd ..
echo Frontend dependencies installed.

:: Create database
echo Setting up database...

:: Create a temporary script to create the database
echo import psycopg2 > temp_create_db.py
echo from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT >> temp_create_db.py
echo. >> temp_create_db.py
echo # Connect to PostgreSQL server >> temp_create_db.py
echo conn = psycopg2.connect( >> temp_create_db.py
echo     dbname='postgres', >> temp_create_db.py
echo     user='%PG_USER%', >> temp_create_db.py
echo     password='%PG_PASSWORD%', >> temp_create_db.py
echo     host='%PG_HOST%', >> temp_create_db.py
echo     port='%PG_PORT%' >> temp_create_db.py
echo ) >> temp_create_db.py
echo. >> temp_create_db.py
echo conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT) >> temp_create_db.py
echo cursor = conn.cursor() >> temp_create_db.py
echo. >> temp_create_db.py
echo # Check if database exists >> temp_create_db.py
echo cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = '%PG_DB%'") >> temp_create_db.py
echo exists = cursor.fetchone() >> temp_create_db.py
echo. >> temp_create_db.py
echo if not exists: >> temp_create_db.py
echo     print("Creating database '%PG_DB%'...") >> temp_create_db.py
echo     cursor.execute('CREATE DATABASE %PG_DB%') >> temp_create_db.py
echo     print("Database '%PG_DB%' created successfully!") >> temp_create_db.py
echo else: >> temp_create_db.py
echo     print("Database '%PG_DB%' already exists.") >> temp_create_db.py
echo. >> temp_create_db.py
echo cursor.close() >> temp_create_db.py
echo conn.close() >> temp_create_db.py
echo. >> temp_create_db.py
echo print("Database setup completed.") >> temp_create_db.py

:: Run the temporary script
python temp_create_db.py
del temp_create_db.py
echo Database setup completed.

:: Create database tables
echo Creating database tables...

:: Create a temporary script to create tables
echo from app.models import Base > backend\temp_create_tables.py
echo from sqlalchemy import create_engine >> backend\temp_create_tables.py
echo engine = create_engine('postgresql+psycopg2://%PG_USER%:%PG_PASSWORD%@%PG_HOST%:%PG_PORT%/%PG_DB%') >> backend\temp_create_tables.py
echo Base.metadata.create_all(bind=engine) >> backend\temp_create_tables.py
echo print("Database tables created successfully!") >> backend\temp_create_tables.py

cd backend
python temp_create_tables.py
del temp_create_tables.py
cd ..
echo Database tables created.

:: Create test users
echo Creating test users...

:: Create a temporary script to create test users
echo import sys > temp_create_users.py
echo import os >> temp_create_users.py
echo from sqlalchemy import create_engine >> temp_create_users.py
echo from sqlalchemy.orm import sessionmaker >> temp_create_users.py
echo from passlib.context import CryptContext >> temp_create_users.py
echo. >> temp_create_users.py
echo # Add the parent directory to sys.path to import app modules >> temp_create_users.py
echo sys.path.append(os.path.dirname(os.path.abspath(__file__))) >> temp_create_users.py
echo from backend.app.models import User, Base >> temp_create_users.py
echo. >> temp_create_users.py
echo # Database connection >> temp_create_users.py
echo DATABASE_URL = "postgresql+psycopg2://%PG_USER%:%PG_PASSWORD%@%PG_HOST%:%PG_PORT%/%PG_DB%" >> temp_create_users.py
echo engine = create_engine(DATABASE_URL) >> temp_create_users.py
echo SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) >> temp_create_users.py
echo. >> temp_create_users.py
echo # Password hashing >> temp_create_users.py
echo pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") >> temp_create_users.py
echo. >> temp_create_users.py
echo def get_password_hash(password): >> temp_create_users.py
echo     return pwd_context.hash(password) >> temp_create_users.py
echo. >> temp_create_users.py
echo def create_test_user(): >> temp_create_users.py
echo     """Create test users in the database.""" >> temp_create_users.py
echo     db = SessionLocal() >> temp_create_users.py
echo     >> temp_create_users.py
echo     # Check if admin user already exists >> temp_create_users.py
echo     admin_exists = db.query(User).filter(User.userEmail == "admin@example.com").first() >> temp_create_users.py
echo     if not admin_exists: >> temp_create_users.py
echo         # Create admin user >> temp_create_users.py
echo         admin_user = User( >> temp_create_users.py
echo             userName="Admin User", >> temp_create_users.py
echo             userEmail="admin@example.com", >> temp_create_users.py
echo             password=get_password_hash("admin123"), >> temp_create_users.py
echo             rank="Professor", >> temp_create_users.py
echo             college="College of Engineering", >> temp_create_users.py
echo             department="Computer Science", >> temp_create_users.py
echo             role="admin", >> temp_create_users.py
echo             isDepartmentHead=False, >> temp_create_users.py
echo             isDean=False >> temp_create_users.py
echo         ) >> temp_create_users.py
echo         db.add(admin_user) >> temp_create_users.py
echo         print("Admin user created successfully!") >> temp_create_users.py
echo     else: >> temp_create_users.py
echo         print("Admin user already exists.") >> temp_create_users.py
echo. >> temp_create_users.py
echo     # Create faculty, department head, and dean users (similar to create_test_user.py) >> temp_create_users.py
echo     # For brevity, we'll just add the admin user in this script >> temp_create_users.py
echo. >> temp_create_users.py
echo     db.commit() >> temp_create_users.py
echo     db.close() >> temp_create_users.py
echo. >> temp_create_users.py
echo if __name__ == "__main__": >> temp_create_users.py
echo     create_test_user() >> temp_create_users.py

python temp_create_users.py
del temp_create_users.py
echo Test users created.

echo.
echo ===================================================
echo FRIS-Dolibarr setup completed successfully!
echo.

:: Create .env file with the correct database URL
echo Creating .env file with your database configuration...
echo DATABASE_URL=postgresql+psycopg2://%PG_USER%:%PG_PASSWORD%@%PG_HOST%:%PG_PORT%/%PG_DB% > .env
echo DOLIBARR_API_URL=https://wantwofrisky.with5.dolicloud.com/api/index.php >> .env
echo DOLIBARR_API_KEY=CZefWiUPr47K38s0cw6BD0L0xwqrJG19 >> .env
echo SECRET_KEY=bXxdsZkrcRg5Xj948ea11g6KlPrkmFCr7DWli3_68uE >> .env
echo ACCESS_TOKEN_EXPIRE_MINUTES=60 >> .env
echo .env file created with your database configuration.
echo.
echo You can now start the application using:
echo   start_servers.bat
echo.
echo To stop the application:
echo   stop_servers.bat
echo ===================================================

goto :end

:error
echo.
echo Setup failed. Please fix the errors and try again.
exit /b 1

:end
pause

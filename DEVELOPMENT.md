# 🚀 Dong-Dong Development Guide

This guide will help you run both the Django backend and React frontend together for development.

## 📋 Prerequisites

- **Node.js** (version 16 or higher) ✅
- **Python 3.8+** 
- **PostgreSQL** (or Docker for database)
- **Redis** (or Docker for Redis)

## 🎯 Quick Start (Recommended)

### Option 1: Automated Setup

1. **Run the setup script:**
   ```bash
   ./run-dev.sh
   ```

2. **Start the backend (Terminal 1):**
   ```bash
   ./start-backend.sh
   ```

3. **Start the frontend (Terminal 2):**
   ```bash
   ./start-frontend.sh
   ```

4. **Access your applications:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

### Option 2: Docker (All-in-One)

1. **Start everything with Docker:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access your applications:**
   - Frontend: http://localhost:3000 (run separately)
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

## 🔧 Manual Setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd dongdong
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

5. **Set up database:**
   ```bash
   # Make sure PostgreSQL is running
   python manage.py migrate
   python manage.py createsuperuser  # Optional
   ```

6. **Start the backend:**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd dongdong-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env if needed (default should work)
   ```

4. **Start the frontend:**
   ```bash
   npm start
   ```

## 🗄️ Database Setup

### Option 1: Local PostgreSQL

1. **Install PostgreSQL:**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # Start PostgreSQL
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Create database and user:**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE dongdong_db;
   CREATE USER dongdong_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE dongdong_db TO dongdong_user;
   \q
   ```

3. **Update .env file:**
   ```env
   DB_NAME=dongdong_db
   DB_USER=dongdong_user
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

### Option 2: Docker PostgreSQL

```bash
# Start only PostgreSQL and Redis
docker-compose -f docker-compose.dev.yml up postgres redis -d
```

## 🔄 Redis Setup

### Option 1: Local Redis

1. **Install Redis:**
   ```bash
   # Ubuntu/Debian
   sudo apt install redis-server
   
   # Start Redis
   sudo systemctl start redis-server
   sudo systemctl enable redis-server
   ```

2. **Update .env file:**
   ```env
   REDIS_URL=redis://localhost:6379/1
   ```

### Option 2: Docker Redis

```bash
# Start only Redis
docker-compose -f docker-compose.dev.yml up redis -d
```

## 🌐 Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=dongdong_db
DB_USER=dongdong_user
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379/1
APP_PORT=8000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG=true
```

## 🚀 Running Commands

### Backend Commands
```bash
cd dongdong
source venv/bin/activate

# Run server
python manage.py runserver

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Check code style
black --check .
```

### Frontend Commands
```bash
cd dongdong-frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Install new package
npm install package-name
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Kill process using port 8000
   lsof -ti:8000 | xargs kill -9
   
   # Kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database connection error:**
   - Check if PostgreSQL is running
   - Verify database credentials in .env
   - Ensure database exists

3. **Redis connection error:**
   - Check if Redis is running
   - Verify Redis URL in .env

4. **Module not found errors:**
   ```bash
   # Backend
   pip install -r requirements.txt
   
   # Frontend
   npm install
   ```

5. **Migration errors:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

### Health Checks

- **Backend Health:** http://localhost:8000/health-check/
- **Frontend:** http://localhost:3000 (should show landing page)
- **Admin Panel:** http://localhost:8000/admin

## 📱 Development Workflow

1. **Start both services:**
   ```bash
   # Terminal 1
   ./start-backend.sh
   
   # Terminal 2
   ./start-frontend.sh
   ```

2. **Make changes:**
   - Backend changes auto-reload
   - Frontend changes auto-reload with hot reload

3. **Test your changes:**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - Admin: http://localhost:8000/admin

## 🐳 Docker Development

### Full Stack with Docker
```bash
# Start backend services
docker-compose -f docker-compose.dev.yml up -d

# Start frontend separately
cd dongdong-frontend
npm start
```

### Individual Services
```bash
# Start only database
docker-compose -f docker-compose.dev.yml up postgres redis -d

# Start only backend
docker-compose -f docker-compose.dev.yml up backend -d
```

## 📊 Monitoring

### Backend Logs
```bash
# Docker logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Direct logs
cd dongdong && source venv/bin/activate && python manage.py runserver
```

### Frontend Logs
```bash
# Frontend logs appear in terminal where you ran npm start
cd dongdong-frontend && npm start
```

## 🎯 Next Steps

1. **Create a superuser** for admin access
2. **Test the API** using the frontend or Postman
3. **Explore the admin panel** at http://localhost:8000/admin
4. **Customize the frontend** design as needed
5. **Add new features** to both backend and frontend

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify environment variables are correct
4. Check that all services are running

---

**Happy coding! 🎉**

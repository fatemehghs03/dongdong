# Dong-Dong

A comprehensive expense splitting and group management API built with Django REST Framework. Dong-Dong allows users to create groups, manage memberships, track shared expenses, and automatically calculate how much each member owes or is owed.

## 🚀 Features

### User Management
- **User Registration & Authentication**: JWT-based authentication system
- **Phone Number Validation**: Iranian phone number format validation (989XXXXXXXXX)
- **Email Support**: Optional email addresses for users
- **Token Management**: Access and refresh token handling with automatic expiration

### Group Management
- **Group Creation**: Users can create groups with custom names and descriptions
- **Role-Based Access**: Three-tier permission system (Owner, Admin, Member)
- **Membership Management**: Add/remove members with different roles
- **Join Requests**: Users can request to join groups
- **Group Invitations**: Group owners/admins can invite users directly
- **Request Management**: Approve/decline join requests and invitations

### Expense Tracking
- **Expense Creation**: Track shared expenses within groups
- **Expense Sharing**: Define how much each member should pay for an expense
- **Group Expense History**: View all expenses for a specific group
- **Automatic Calculations**: Calculate net balances between group members
- **Detailed Descriptions**: Add descriptions to expenses for better tracking

### Technical Features
- **RESTful API**: Clean, well-structured REST endpoints
- **Database**: PostgreSQL for reliable data storage
- **Caching**: Redis integration for improved performance
- **Docker Support**: Containerized deployment with Docker Compose
- **Health Checks**: Built-in health monitoring endpoint
- **Environment Configuration**: Secure environment variable management

## 🛠️ Technology Stack

- **Backend**: Django 4.2 with Django REST Framework
- **Database**: PostgreSQL 15
- **Caching**: Redis 7
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker & Docker Compose
- **Code Quality**: Black formatter, Pre-commit hooks

## 📋 Prerequisites

- Docker and Docker Compose
- Python 3.8+ (if running locally)
- PostgreSQL (if running locally)
- Redis (if running locally)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Dong-Dong/dongdong
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DB_NAME=dongdong_db
   DB_USER=dongdong_user
   DB_PASSWORD=your-db-password
   DB_HOST=postgres
   DB_PORT=5432
   REDIS_URL=redis://redis:6379/1
   APP_PORT=8000
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin
   - Health Check: http://localhost:8000/health-check/

### Local Development

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables** (create `.env` file as shown above)

3. **Run migrations**
   ```bash
   python manage.py migrate
   ```

4. **Start the development server**
   ```bash
   python manage.py runserver
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /users/register/` - Register a new user
- `POST /users/login/` - Login and get JWT tokens
- `POST /users/logout/` - Logout and invalidate tokens
- `POST /users/refresh-token/` - Refresh access token

### Group Management Endpoints
- `GET/POST /groups/group/` - List all groups or create a new group
- `GET/PUT/DELETE /groups/group/{id}/` - Get, update, or delete a specific group
- `GET/POST /groups/join-request/` - List or create join requests
- `GET/PUT/DELETE /groups/join-request/{id}/` - Manage specific join requests
- `GET /groups/group-join-requests/{id}/` - Get join requests for a specific group
- `GET/POST /groups/membership/` - List or create memberships
- `GET/PUT/DELETE /groups/membership/{id}/` - Manage specific memberships
- `GET /groups/group-memberships/{id}/` - Get memberships for a specific group
- `GET/POST /groups/invitation/` - List or create invitations
- `GET/PUT/DELETE /groups/invitation/{id}/` - Manage specific invitations
- `GET /groups/group-invitations/{id}/` - Get invitations for a specific group

### Expense Management Endpoints
- `GET/POST /expenses/expense/` - List all expenses or create a new expense
- `GET/PUT/DELETE /expenses/expense/{id}/` - Get, update, or delete a specific expense
- `GET /expenses/group-expenses/{id}/` - Get all expenses for a specific group
- `GET /expenses/calculate/{id}/` - Calculate balances for a specific group

### Utility Endpoints
- `GET /health-check/` - Application health status

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Required |
| `DEBUG` | Debug mode | `False` |
| `DB_NAME` | Database name | Required |
| `DB_USER` | Database user | Required |
| `DB_PASSWORD` | Database password | Required |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/1` |
| `APP_PORT` | Application port | `8000` |

### JWT Configuration
- **Access Token Lifetime**: 15 minutes
- **Refresh Token Lifetime**: 7 days
- **Algorithm**: HS256

## 🏗️ Project Structure

```
dongdong/
├── dongdong/              # Main Django project
│   ├── settings.py        # Django settings
│   ├── urls.py           # Main URL configuration
│   └── views.py          # Health check view
├── users/                 # User management app
│   ├── models.py         # User model
│   ├── views.py          # Authentication views
│   ├── serializers.py    # User serializers
│   └── authentication.py # JWT authentication
├── groups/                # Group management app
│   ├── models.py         # Group, Membership, Invitation models
│   ├── views.py          # Group management views
│   ├── serializers.py    # Group serializers
│   └── permissions.py    # Custom permissions
├── expenses/              # Expense tracking app
│   ├── models.py         # Expense and ExpenseShare models
│   ├── views.py          # Expense management views
│   ├── serializers.py    # Expense serializers
│   └── helper.py         # Calculation helpers
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Docker image configuration
└── requirements.txt      # Python dependencies
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Validation**: Django's built-in password validators
- **Phone Number Validation**: Iranian phone number format enforcement
- **Role-Based Permissions**: Granular access control for group operations
- **Environment Variables**: Sensitive data stored in environment variables
- **CSRF Protection**: Django's CSRF middleware enabled

## 🧪 Development

### Code Quality
- **Black**: Code formatting
- **Pre-commit**: Git hooks for code quality
- **Type Hints**: Python type annotations

### Running Tests
```bash
python manage.py test
```

### Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

## 📝 Usage Examples

### 1. Register a User
```bash
curl -X POST http://localhost:8000/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "phone_number": "989123456789",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### 2. Create a Group
```bash
curl -X POST http://localhost:8000/groups/group/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Trip to Paris",
    "description": "Expenses for our Paris vacation"
  }'
```

### 3. Add an Expense
```bash
curl -X POST http://localhost:8000/expenses/expense/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hotel Booking",
    "group": 1,
    "description": "3 nights at Hotel Plaza",
    "shares": [
      {"user": 1, "share_amount": "150.00"},
      {"user": 2, "share_amount": "150.00"}
    ]
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@dongdong.com or create an issue in the repository.

---

**Dong-Dong** - Making expense splitting simple and fair! 🎯

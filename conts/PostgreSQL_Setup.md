# PostgreSQL Database Setup Guide

## PostgreSQL Service Information
- **Service ID**: dpg-d2vgtg3uibrs738jk4i0-a
- **Database Name**: ahp_app
- **Service Type**: PostgreSQL

## Environment Variables for Render.com

Set these environment variables in your Render.com service dashboard:

```
DATABASE_NAME=ahp_app
DATABASE_USER=ahp_app_user
DATABASE_PASSWORD=[PostgreSQL 비밀번호]
DATABASE_HOST=[PostgreSQL 호스트 주소]
DATABASE_PORT=5432
```

## Database Migration Steps

1. **Update environment variables** in Render.com dashboard
2. **Trigger rebuild** by pushing code changes
3. **Run migrations** automatically via render-build.sh
4. **Create admin account** via management command

## Admin Account Creation

The system will automatically create an admin account during deployment:
- **Username**: admin
- **Password**: ahp2025admin
- **Email**: admin@ahp-platform.com

## Manual Admin Creation (if needed)

If automatic creation fails, run these scripts on the server:

```bash
# Using Django management command
python manage.py create_admin

# Using standalone script
python create_production_admin.py
```

## Database Connection Test

Test the connection:
```bash
python manage.py dbshell
```

## API Endpoints for Testing

- Login: `POST /api/login/`
- User Info: `GET /api/user/`
- Admin Panel: `/admin/`

## Frontend Integration

The frontend at https://aebonlee.github.io/ahp_app/ is configured to connect to:
- Backend: https://ahp-django-backend.onrender.com
- Login credentials: admin / ahp2025admin
# 🔄 AHP Application Complete Backup & Restore Guide

**Backup Date**: 2025-09-30  
**Backup Repository**: https://github.com/aebonlee/ahp_app_0930_backuup  
**Backup Tag**: `v2025.09.30-backup`

## 📋 Backup Contents

### ✅ What's Included
- **Frontend**: Complete React TypeScript application
- **Backend**: Django REST API with all models and admin interfaces
- **Database**: PostgreSQL schema and sample data
- **Configurations**: Environment settings, deployment configurations
- **Features**: 3-category survey template system, AHP evaluation system

### 🎯 Key Features Backed Up
1. **Survey System**
   - 3-category template selection (Standard/Academic/Business)
   - SurveyFormBuilder with dynamic question types
   - Survey management and administration
   - Demographic survey collection

2. **AHP Evaluation System**
   - Pairwise comparison interface
   - Criteria and alternatives management
   - Result calculation and analysis
   - Multi-evaluator support

3. **User Management**
   - Authentication and authorization
   - Role-based access control
   - User profiles and settings

4. **Database Models**
   - Complete survey data models
   - AHP evaluation models
   - User and project management
   - Results and analytics storage

## 🚀 Complete Restoration Process

### Step 1: Clone Backup Repository
```bash
git clone https://github.com/aebonlee/ahp_app_0930_backuup.git
cd ahp_app_0930_backuup

# Checkout specific backup tag
git checkout v2025.09.30-backup
```

### Step 2: Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
# REACT_APP_API_URL=https://your-backend-url.com
# REACT_APP_ENVIRONMENT=production

# Build application
npm run build

# Deploy (if using GitHub Pages)
npm run deploy
```

### Step 3: Backend Setup
```bash
# Navigate to Django backend
cd django_backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Edit .env file with your settings:
# DEBUG=False
# SECRET_KEY=your-secret-key
# DATABASE_URL=postgresql://username:password@localhost:5432/ahp_database
# ALLOWED_HOSTS=your-domain.com,localhost
```

### Step 4: Database Restoration
```bash
# Create PostgreSQL database
createdb ahp_database

# Create user (optional)
createuser -P ahp_user  # Enter password when prompted

# Restore schema
psql -d ahp_database -f ../backup_database.sql

# Grant permissions
psql -d ahp_database -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ahp_user;"
psql -d ahp_database -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ahp_user;"
```

### Step 5: Django Backend Deployment
```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Test server locally
python manage.py runserver

# Deploy to production (example: Render, Heroku, etc.)
# Follow your hosting provider's Django deployment guide
```

### Step 6: Verification
```bash
# Test frontend
npm start  # Should show application with survey templates

# Test backend
curl http://localhost:8000/api/service/status/

# Test database
python manage.py shell
>>> from apps.evaluations.models import DemographicSurvey
>>> DemographicSurvey.objects.count()

# Test survey templates
# Visit: http://localhost:3000/?tab=demographic-survey
# Should show 3-category template selection
```

## 🔧 Configuration Files

### Frontend Environment (.env)
```env
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=2025.09.30-backup
PUBLIC_URL=/ahp_app
```

### Backend Environment (.env)
```env
DEBUG=False
SECRET_KEY=your-very-long-secret-key-here
DATABASE_URL=postgresql://username:password@localhost:5432/ahp_database
ALLOWED_HOSTS=your-domain.com,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
DJANGO_SETTINGS_MODULE=ahp_backend.settings
```

### Database Connection Test
```python
# Run this in Django shell to test database
python manage.py shell

from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT COUNT(*) FROM survey_templates")
print(f"Survey templates: {cursor.fetchone()[0]}")

from apps.evaluations.models import DemographicSurvey
print(f"DemographicSurvey model available: {DemographicSurvey._meta.verbose_name}")
```

## 📊 Expected Working Features After Restore

### Frontend Features
- ✅ 3-category survey template selection page
- ✅ Survey form builder with dynamic questions
- ✅ AHP evaluation interface
- ✅ Project management dashboard
- ✅ User authentication and profiles
- ✅ Responsive design with dark/light themes

### Backend Features
- ✅ Django admin interface for survey management
- ✅ REST API endpoints for all operations
- ✅ User authentication and permissions
- ✅ Database models for surveys and evaluations
- ✅ Survey template system
- ✅ Data export and analytics

### Database Features
- ✅ Complete schema with all tables
- ✅ Proper indexes for performance
- ✅ Sample survey templates
- ✅ Foreign key relationships
- ✅ Data integrity constraints

## 🆘 Troubleshooting

### Common Issues and Solutions

#### Frontend Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Backend Database Errors
```bash
# Reset migrations (if needed)
python manage.py migrate --fake-initial

# Check database connection
python manage.py dbshell
```

#### CORS Issues
- Ensure `CORS_ALLOWED_ORIGINS` includes your frontend domain
- Check that `ALLOWED_HOSTS` includes your backend domain

#### Survey Template Issues
- Verify survey templates are loaded: `/admin/evaluations/surveytemplate/`
- Check that `SurveyFormBuilder` component is imported correctly

### File Locations
- **Frontend**: All React components in `src/`
- **Survey Components**: `src/components/survey/`
- **Backend Models**: `django_backend/apps/evaluations/models.py`
- **Admin Interface**: `django_backend/apps/evaluations/admin.py`
- **Database Schema**: `backup_database.sql`

## 🔗 Quick Links
- **Live Application**: https://aebonlee.github.io/ahp_app/
- **Backend API**: https://ahp-django-backend.onrender.com/
- **Survey Page**: https://aebonlee.github.io/ahp_app/?tab=demographic-survey
- **Django Admin**: https://ahp-django-backend.onrender.com/admin/

## 📞 Support
If you encounter issues during restoration:
1. Check this guide's troubleshooting section
2. Verify all environment variables are correctly set
3. Ensure database permissions are granted
4. Test each component individually

---

**This backup contains a complete, working AHP application with 3-category survey template system as of 2025-09-30.**
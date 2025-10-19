#!/usr/bin/env python
"""
Simple database connection test script
Tests database connectivity and basic model operations
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

# Now we can import Django models
from django.db import connection, transaction
from django.contrib.auth import get_user_model
from apps.evaluations.models import DemographicSurvey, Evaluation
from apps.projects.models import Project

User = get_user_model()

def test_database_connection():
    """Test basic database connection"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print("✅ Database connection successful!")
            print(f"   Test query result: {result}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_model_operations():
    """Test basic model operations"""
    try:
        # Test User model
        user_count = User.objects.count()
        print(f"✅ User model accessible. Total users: {user_count}")
        
        # Test Project model  
        project_count = Project.objects.count()
        print(f"✅ Project model accessible. Total projects: {project_count}")
        
        # Test Evaluation model
        evaluation_count = Evaluation.objects.count()
        print(f"✅ Evaluation model accessible. Total evaluations: {evaluation_count}")
        
        # Test DemographicSurvey model
        survey_count = DemographicSurvey.objects.count()
        print(f"✅ DemographicSurvey model accessible. Total surveys: {survey_count}")
        
        return True
    except Exception as e:
        print(f"❌ Model operations failed: {e}")
        return False

def test_database_structure():
    """Test database table structure"""
    try:
        with connection.cursor() as cursor:
            # Check if key tables exist
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('demographic_surveys', 'evaluations', 'projects', 'auth_user')
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            
            print("✅ Database tables found:")
            for table in tables:
                print(f"   - {table[0]}")
                
            # Check DemographicSurvey table structure
            cursor.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'demographic_surveys'
                ORDER BY ordinal_position;
            """)
            columns = cursor.fetchall()
            
            print("✅ DemographicSurvey table columns:")
            for column in columns[:10]:  # Show first 10 columns
                print(f"   - {column[0]}: {column[1]}")
            if len(columns) > 10:
                print(f"   ... and {len(columns) - 10} more columns")
                
        return True
    except Exception as e:
        print(f"❌ Database structure check failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting AHP Backend Database Connection Test")
    print("=" * 50)
    
    # Test 1: Database Connection
    print("\n1. Testing Database Connection...")
    db_ok = test_database_connection()
    
    if not db_ok:
        print("🔥 Database connection failed. Exiting...")
        return False
    
    # Test 2: Model Operations
    print("\n2. Testing Model Operations...")
    models_ok = test_model_operations()
    
    # Test 3: Database Structure
    print("\n3. Testing Database Structure...")
    structure_ok = test_database_structure()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   Database Connection: {'✅ PASS' if db_ok else '❌ FAIL'}")
    print(f"   Model Operations: {'✅ PASS' if models_ok else '❌ FAIL'}")
    print(f"   Database Structure: {'✅ PASS' if structure_ok else '❌ FAIL'}")
    
    if db_ok and models_ok and structure_ok:
        print("\n🎉 All tests passed! Database is ready for survey operations.")
        return True
    else:
        print("\n⚠️ Some tests failed. Please check the configuration.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
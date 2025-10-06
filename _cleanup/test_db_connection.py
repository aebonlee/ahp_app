"""
PostgreSQL Database Connection Test
Tests connection to Render.com hosted PostgreSQL database
"""

import psycopg2
from psycopg2 import OperationalError
import sys

# Database connection parameters from settings.py
DB_CONFIG = {
    'host': 'dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com',
    'database': 'ahp_app',
    'user': 'ahp_app_user',
    'password': 'xEcCdn2WB32sxLYIPAncc9cHARXf1t6d',
    'port': 5432
}

def test_connection():
    """Test PostgreSQL database connection"""
    try:
        print("Attempting to connect to PostgreSQL database...")
        print(f"Host: {DB_CONFIG['host']}")
        print(f"Database: {DB_CONFIG['database']}")
        print(f"User: {DB_CONFIG['user']}")
        
        # Establish connection
        connection = psycopg2.connect(
            host=DB_CONFIG['host'],
            database=DB_CONFIG['database'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            port=DB_CONFIG['port']
        )
        
        # Create cursor
        cursor = connection.cursor()
        
        # Test query - check PostgreSQL version
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print("\n✅ Successfully connected to PostgreSQL!")
        print(f"Database version: {version[0]}")
        
        # List all tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        print(f"\n📊 Found {len(tables)} tables in the database:")
        for table in tables[:10]:  # Show first 10 tables
            print(f"  - {table[0]}")
        if len(tables) > 10:
            print(f"  ... and {len(tables) - 10} more tables")
        
        # Test Django tables
        django_tables = ['django_migrations', 'auth_user', 'projects_project']
        print("\n🔍 Checking Django tables:")
        for table_name in django_tables:
            cursor.execute(f"""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_name = %s;
            """, (table_name,))
            exists = cursor.fetchone()[0] > 0
            status = "✅" if exists else "❌"
            print(f"  {status} {table_name}: {'Exists' if exists else 'Not found'}")
        
        # Close connections
        cursor.close()
        connection.close()
        
        print("\n✅ Database connection test completed successfully!")
        return True
        
    except OperationalError as e:
        print(f"\n❌ Failed to connect to database: {e}")
        return False
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
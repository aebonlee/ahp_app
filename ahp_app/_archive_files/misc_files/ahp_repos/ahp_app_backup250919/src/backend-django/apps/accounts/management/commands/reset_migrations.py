from django.core.management.base import BaseCommand
from django.db import connection
from django.core.management import execute_from_command_line


class Command(BaseCommand):
    help = 'Reset migrations for custom User model deployment'

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🔄 Resetting migrations for custom User model...')
        )

        try:
            with connection.cursor() as cursor:
                # Clear problematic migration records
                cursor.execute("""
                    DELETE FROM django_migrations 
                    WHERE app IN ('admin', 'auth') 
                    AND applied > (
                        SELECT COALESCE(MAX(applied), '1900-01-01')
                        FROM django_migrations 
                        WHERE app = 'accounts'
                    );
                """)
                
                self.stdout.write(
                    self.style.SUCCESS('   ✅ Cleared problematic admin/auth migrations')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'   ⚠️ Migration cleanup failed: {e}')
            )

        self.stdout.write(
            self.style.SUCCESS('🎉 Migration reset complete!')
        )
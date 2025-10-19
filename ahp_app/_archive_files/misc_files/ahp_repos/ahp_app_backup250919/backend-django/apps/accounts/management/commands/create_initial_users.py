from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from apps.accounts.models import User


class Command(BaseCommand):
    help = 'Create initial users for AHP Platform'

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Creating initial users for AHP Platform...')
        )

        users_to_create = [
            {
                'username': 'admin',
                'email': 'admin@ahp-platform.com',
                'password': 'ahp2025admin',
                'full_name': 'AHP Platform Administrator',
                'organization': 'AHP Platform',
                'department': 'System Administration',
                'position': 'Super Administrator',
                'is_superuser': True,
                'is_staff': True,
                'is_admin': True,
                'is_project_manager': True,
            },
            {
                'username': 'demo',
                'email': 'demo@ahp-platform.com',
                'password': 'demo2025',
                'full_name': 'Demo User',
                'organization': 'Demo Organization',
                'department': 'Research',
                'position': 'Researcher',
                'is_project_manager': True,
            },
            {
                'username': 'test',
                'email': 'test@ahp-platform.com',
                'password': 'test2025',
                'full_name': 'Test User',
                'organization': 'Test Organization',
                'department': 'Testing',
                'position': 'Test Evaluator',
                'is_evaluator': True,
            }
        ]

        for user_data in users_to_create:
            username = user_data['username']

            # Check if user already exists
            if User.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.WARNING(f"   ⚠️ User '{username}' already exists, skipping...")
                )
                continue

            # Create user
            user = User.objects.create(
                username=user_data['username'],
                email=user_data['email'],
                full_name=user_data['full_name'],
                organization=user_data.get('organization', ''),
                department=user_data.get('department', ''),
                position=user_data.get('position', ''),
                is_superuser=user_data.get('is_superuser', False),
                is_staff=user_data.get('is_staff', False),
                is_admin=user_data.get('is_admin', False),
                is_project_manager=user_data.get('is_project_manager', False),
                is_evaluator=user_data.get('is_evaluator', True),
                language='ko',
                password=make_password(user_data['password'])
            )

            user_type = "SUPERUSER" if user.is_superuser else ("ADMIN" if user.is_admin else "USER")
            self.stdout.write(
                self.style.SUCCESS(f"   ✅ Created {user_type}: {username} ({user.email})")
            )

        self.stdout.write(
            self.style.SUCCESS('\n🎉 User creation complete!')
        )

        self.stdout.write('\n📋 LOGIN CREDENTIALS:')
        self.stdout.write('=' * 50)
        self.stdout.write('🔑 Super Administrator:')
        self.stdout.write('   Username: admin')
        self.stdout.write('   Password: ahp2025admin')
        self.stdout.write('   Email: admin@ahp-platform.com')
        self.stdout.write('')
        self.stdout.write('🔑 Demo User (Project Manager):')
        self.stdout.write('   Username: demo')
        self.stdout.write('   Password: demo2025')
        self.stdout.write('   Email: demo@ahp-platform.com')
        self.stdout.write('')
        self.stdout.write('🔑 Test User (Evaluator):')
        self.stdout.write('   Username: test')
        self.stdout.write('   Password: test2025')
        self.stdout.write('   Email: test@ahp-platform.com')
        self.stdout.write('=' * 50)

        self.stdout.write(f'\n📊 Total users in database: {User.objects.count()}')
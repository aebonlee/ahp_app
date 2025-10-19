#!/usr/bin/env python3
"""
Django Management Commands Helper
Production 환경에서 필요한 관리 명령어들
"""

import os
import sys
import subprocess

def run_command(command, description=""):
    """Run a command and print the result"""
    print(f"\n{'='*60}")
    if description:
        print(f"Running: {description}")
    print(f"Command: {command}")
    print('='*60)
    
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)
    print(f"Return code: {result.returncode}")
    return result.returncode == 0

def main():
    """Run all necessary management commands"""
    commands = [
        ("python manage.py makemigrations", "Generate migrations"),
        ("python manage.py migrate", "Apply database migrations"),
        ("python manage.py collectstatic --noinput", "Collect static files"),
    ]
    
    print("Django Management Commands")
    print("Current directory:", os.getcwd())
    
    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__))
    if os.path.exists(backend_dir):
        os.chdir(backend_dir)
        print("Changed to:", os.getcwd())
    
    success_count = 0
    for command, description in commands:
        if run_command(command, description):
            success_count += 1
        else:
            print(f"❌ Failed: {description}")
            break
    
    print(f"\n{'='*60}")
    print(f"Completed {success_count}/{len(commands)} commands successfully")
    print('='*60)

if __name__ == "__main__":
    main()
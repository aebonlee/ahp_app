#!/usr/bin/env python3
"""
긴급 Render.com 배포 트리거
GitHub 커밋이 자동 배포되지 않을 때 사용
"""

import os
import sys
from datetime import datetime

def create_deploy_trigger():
    """배포 트리거 파일 생성"""
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    trigger_content = f"""
# 🚨 URGENT RENDER.COM DEPLOYMENT TRIGGER 🚨
# 생성시각: {timestamp}
# 
# DEPLOYMENT ISSUE: GitHub 자동 배포가 작동하지 않음
# 마지막 배포: September 16, 2025 at 9:58 PM (a63b478)
# 현재 커밋: c4b9a59 (2025-09-23 12:10)
# 
# REQUIRED FIXES:
# 1. PostgreSQL simple_projects 테이블 생성
# 2. 마이그레이션 실행 강화
# 3. 환경변수 설정 확인
# 
# DATABASE CONFIG:
# - URL: postgresql://ahp_app_user:xEcCdn2WB32sxLYIPAncc9cHARXf1t6d@dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com/ahp_app
# - Status: TABLES MISSING
# - Fix: FORCE MIGRATION
# 
# DEPLOYMENT COMMANDS:
# 1. Manual Deploy on Render.com Dashboard
# 2. Select latest commit: c4b9a59
# 3. Monitor build logs for table creation
# 
# EMERGENCY STATUS: CRITICAL
# ACTION REQUIRED: IMMEDIATE MANUAL DEPLOYMENT
"""

    # 다양한 트리거 파일 생성
    trigger_files = [
        "ahp_django_service_updated/DEPLOY_NOW.txt",
        "ahp_django_service_updated/FORCE_BUILD.txt", 
        "ahp_django_service_updated/TRIGGER_DEPLOY.md",
        "RENDER_DEPLOY_URGENT.txt"
    ]
    
    for file_path in trigger_files:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(trigger_content)
            print(f"✅ Created: {file_path}")
        except Exception as e:
            print(f"❌ Failed to create {file_path}: {e}")

if __name__ == "__main__":
    print("🚨 Creating urgent deployment triggers...")
    create_deploy_trigger()
    print("✅ All deployment trigger files created")
    print("\n📋 Next steps:")
    print("1. Commit and push these files to GitHub") 
    print("2. Go to Render.com dashboard")
    print("3. Manually deploy the latest commit")
    print("4. Monitor build logs")
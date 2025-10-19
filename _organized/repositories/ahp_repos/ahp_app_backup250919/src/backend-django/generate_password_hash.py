"""
Django 비밀번호 해시 생성 스크립트
PostgreSQL에 직접 입력할 수 있는 암호화된 비밀번호 생성
"""
from django.contrib.auth.hashers import make_password
import sys

def generate_password_hash(password):
    """Django 형식의 비밀번호 해시 생성"""
    hashed = make_password(password)
    return hashed

if __name__ == "__main__":
    print("\n" + "="*60)
    print("Django 비밀번호 해시 생성기")
    print("="*60)
    
    # 테스트할 비밀번호 목록
    passwords = {
        'admin': 'ahp2025admin',
        'testuser': 'test1234',
        'evaluator1': 'eval1234',
        'enterprise1': 'corp1234',
        'aebon': 'aebon2025'
    }
    
    print("\n생성된 비밀번호 해시:\n")
    
    for username, password in passwords.items():
        hashed = generate_password_hash(password)
        print(f"-- {username} (비밀번호: {password})")
        print(f"'{hashed}',\n")
    
    print("\n" + "="*60)
    print("위 해시를 SQL INSERT 문에 사용하세요.")
    print("="*60)
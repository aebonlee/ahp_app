#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
프로덕션 빌드용 console.log 제거 스크립트
개발 환경에서는 유지하되, 프로덕션에서만 제거
"""

import os
import re
import sys

def remove_console_logs(file_path):
    """파일에서 console.log 제거"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # console.log 관련 패턴 제거
        patterns = [
            # 단일 라인 console.log
            r'^\s*console\.log\([^)]*\);\s*$',
            # 여러 줄에 걸친 console.log
            r'^\s*console\.log\(\s*[\s\S]*?\);\s*$',
            # console.warn, console.error도 제거 (선택적)
            # r'^\s*console\.(warn|error)\([^)]*\);\s*$',
        ]
        
        lines = content.split('\n')
        filtered_lines = []
        skip_next = False
        
        for i, line in enumerate(lines):
            # console.log가 포함된 라인 확인
            if 'console.log' in line or 'console.warn' in line or 'console.error' in line:
                # 주석이 아닌 경우만 제거
                if not line.strip().startswith('//') and not line.strip().startswith('*'):
                    # 디버그 목적의 주석 추가
                    indent = len(line) - len(line.lstrip())
                    filtered_lines.append(' ' * indent + f'// [REMOVED] {line.strip()}')
                    continue
            
            filtered_lines.append(line)
        
        new_content = '\n'.join(filtered_lines)
        
        # 변경사항이 있을 때만 파일 업데이트
        if original_content != new_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def scan_and_remove(directory):
    """디렉토리 스캔하여 console.log 제거"""
    modified_files = []
    total_files = 0
    
    for root, dirs, files in os.walk(directory):
        # node_modules, build 디렉토리 제외
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'build', '.git', 'dist']]
        
        for file in files:
            if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                file_path = os.path.join(root, file)
                total_files += 1
                
                if remove_console_logs(file_path):
                    modified_files.append(file_path)
    
    return modified_files, total_files

if __name__ == '__main__':
    print("🔍 console.log 제거 스크립트 실행 중...")
    print("=" * 60)
    
    src_dir = '/home/user/webapp/src'
    
    if not os.path.exists(src_dir):
        print(f"❌ 디렉토리를 찾을 수 없습니다: {src_dir}")
        sys.exit(1)
    
    modified_files, total_files = scan_and_remove(src_dir)
    
    print(f"\n📊 스캔 결과:")
    print(f"   - 전체 파일: {total_files}개")
    print(f"   - 수정된 파일: {len(modified_files)}개")
    
    if modified_files:
        print(f"\n✅ 수정된 파일 목록:")
        for file_path in modified_files[:20]:  # 처음 20개만 표시
            print(f"   - {file_path.replace('/home/user/webapp/', '')}")
        
        if len(modified_files) > 20:
            print(f"   ... 외 {len(modified_files) - 20}개 파일")
    else:
        print("\n✅ 제거할 console.log가 없습니다.")
    
    print("\n✅ 작업 완료!")

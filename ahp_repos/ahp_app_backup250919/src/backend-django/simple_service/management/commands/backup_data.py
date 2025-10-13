from django.core.management.base import BaseCommand
from django.core import serializers
from django.contrib.auth.models import User
from simple_service.models import SimpleProject, SimpleCriteria, SimpleComparison, SimpleResult, SimpleData
import json
import os
from datetime import datetime


class Command(BaseCommand):
    help = 'AHP 시스템 데이터 백업'

    def add_arguments(self, parser):
        parser.add_argument('--output', type=str, help='백업 파일 경로')
        parser.add_argument('--format', type=str, default='json', choices=['json', 'yaml'], help='백업 형식')

    def handle(self, *args, **options):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = options.get('output') or f'backup_{timestamp}.json'
        format_type = options.get('format', 'json')

        self.stdout.write(f"🔄 AHP 데이터 백업 시작...")
        
        try:
            backup_data = {}
            
            # 사용자 데이터 백업
            users = User.objects.all()
            backup_data['users'] = json.loads(serializers.serialize('json', users))
            self.stdout.write(f"✅ 사용자 데이터: {users.count()}개")
            
            # 프로젝트 데이터 백업
            projects = SimpleProject.objects.all()
            backup_data['projects'] = json.loads(serializers.serialize('json', projects))
            self.stdout.write(f"✅ 프로젝트: {projects.count()}개")
            
            # 평가기준 데이터 백업
            criteria = SimpleCriteria.objects.all()
            backup_data['criteria'] = json.loads(serializers.serialize('json', criteria))
            self.stdout.write(f"✅ 평가기준: {criteria.count()}개")
            
            # 쌍대비교 데이터 백업
            comparisons = SimpleComparison.objects.all()
            backup_data['comparisons'] = json.loads(serializers.serialize('json', comparisons))
            self.stdout.write(f"✅ 쌍대비교: {comparisons.count()}개")
            
            # 결과 데이터 백업
            results = SimpleResult.objects.all()
            backup_data['results'] = json.loads(serializers.serialize('json', results))
            self.stdout.write(f"✅ 결과: {results.count()}개")
            
            # 추가 데이터 백업
            data = SimpleData.objects.all()
            backup_data['data'] = json.loads(serializers.serialize('json', data))
            self.stdout.write(f"✅ 추가 데이터: {data.count()}개")
            
            # 메타데이터 추가
            backup_data['metadata'] = {
                'backup_timestamp': timestamp,
                'django_version': '5.0.8',
                'ahp_version': '2.0.1',
                'total_records': (
                    users.count() + projects.count() + criteria.count() + 
                    comparisons.count() + results.count() + data.count()
                )
            }
            
            # 파일로 저장
            os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(backup_data, f, ensure_ascii=False, indent=2)
            
            file_size = os.path.getsize(output_path) / 1024 / 1024  # MB
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n🎉 백업 완료!\n'
                    f'📁 파일: {output_path}\n'
                    f'📊 크기: {file_size:.2f} MB\n'
                    f'📈 총 레코드: {backup_data["metadata"]["total_records"]}개\n'
                    f'🕐 시간: {timestamp}'
                )
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ 백업 실패: {str(e)}')
            )
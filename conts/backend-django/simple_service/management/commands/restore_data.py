from django.core.management.base import BaseCommand
from django.core import serializers
from django.contrib.auth.models import User
from simple_service.models import SimpleProject, SimpleCriteria, SimpleComparison, SimpleResult, SimpleData
import json
import os


class Command(BaseCommand):
    help = 'AHP 시스템 데이터 복구'

    def add_arguments(self, parser):
        parser.add_argument('backup_file', type=str, help='백업 파일 경로')
        parser.add_argument('--clear', action='store_true', help='복구 전 기존 데이터 삭제')
        parser.add_argument('--dry-run', action='store_true', help='실제 복구 없이 테스트만 실행')

    def handle(self, *args, **options):
        backup_file = options['backup_file']
        clear_data = options.get('clear', False)
        dry_run = options.get('dry_run', False)

        if not os.path.exists(backup_file):
            self.stdout.write(
                self.style.ERROR(f'❌ 백업 파일을 찾을 수 없습니다: {backup_file}')
            )
            return

        self.stdout.write(f"🔄 데이터 복구 {'(테스트 모드)' if dry_run else ''} 시작...")
        
        try:
            with open(backup_file, 'r', encoding='utf-8') as f:
                backup_data = json.load(f)
            
            # 백업 파일 검증
            required_keys = ['users', 'projects', 'criteria', 'comparisons', 'results', 'data', 'metadata']
            missing_keys = [key for key in required_keys if key not in backup_data]
            
            if missing_keys:
                self.stdout.write(
                    self.style.ERROR(f'❌ 백업 파일이 손상되었습니다. 누락된 키: {missing_keys}')
                )
                return
            
            metadata = backup_data['metadata']
            self.stdout.write(f"📊 백업 정보:")
            self.stdout.write(f"   🕐 생성일: {metadata['backup_timestamp']}")
            self.stdout.write(f"   📈 총 레코드: {metadata['total_records']}개")
            self.stdout.write(f"   🔢 버전: {metadata.get('ahp_version', '불명')}")
            
            if dry_run:
                self.stdout.write(
                    self.style.SUCCESS('\n✅ 백업 파일 검증 완료! 실제 복구를 하려면 --dry-run 옵션을 제거하세요.')
                )
                return
            
            # 기존 데이터 삭제 (옵션)
            if clear_data:
                self.stdout.write("⚠️  기존 데이터 삭제 중...")
                SimpleData.objects.all().delete()
                SimpleResult.objects.all().delete()
                SimpleComparison.objects.all().delete()
                SimpleCriteria.objects.all().delete()
                SimpleProject.objects.all().delete()
                # 사용자는 보안상 삭제하지 않음
                self.stdout.write("✅ 기존 데이터 삭제 완료")
            
            # 데이터 복구 (순서 중요: 외래키 관계 고려)
            restored_counts = {}
            
            # 사용자 복구 (중복 방지)
            for user_data in backup_data['users']:
                fields = user_data['fields']
                username = fields['username']
                
                if not User.objects.filter(username=username).exists():
                    user = User(**fields)
                    user.pk = user_data['pk']
                    user.save()
                    restored_counts['users'] = restored_counts.get('users', 0) + 1
            
            # 프로젝트 복구
            for obj_data in backup_data['projects']:
                obj = SimpleProject(**obj_data['fields'])
                obj.pk = obj_data['pk']
                obj.save()
                restored_counts['projects'] = restored_counts.get('projects', 0) + 1
            
            # 평가기준 복구
            for obj_data in backup_data['criteria']:
                obj = SimpleCriteria(**obj_data['fields'])
                obj.pk = obj_data['pk']
                obj.save()
                restored_counts['criteria'] = restored_counts.get('criteria', 0) + 1
            
            # 쌍대비교 복구
            for obj_data in backup_data['comparisons']:
                obj = SimpleComparison(**obj_data['fields'])
                obj.pk = obj_data['pk']
                obj.save()
                restored_counts['comparisons'] = restored_counts.get('comparisons', 0) + 1
            
            # 결과 복구
            for obj_data in backup_data['results']:
                obj = SimpleResult(**obj_data['fields'])
                obj.pk = obj_data['pk']
                obj.save()
                restored_counts['results'] = restored_counts.get('results', 0) + 1
            
            # 추가 데이터 복구
            for obj_data in backup_data['data']:
                obj = SimpleData(**obj_data['fields'])
                obj.pk = obj_data['pk']
                obj.save()
                restored_counts['data'] = restored_counts.get('data', 0) + 1
            
            total_restored = sum(restored_counts.values())
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n🎉 데이터 복구 완료!\n'
                    f'📊 복구된 데이터:\n'
                    f'   👥 사용자: {restored_counts.get("users", 0)}개\n'
                    f'   📁 프로젝트: {restored_counts.get("projects", 0)}개\n'
                    f'   📋 평가기준: {restored_counts.get("criteria", 0)}개\n'
                    f'   🔄 쌍대비교: {restored_counts.get("comparisons", 0)}개\n'
                    f'   📊 결과: {restored_counts.get("results", 0)}개\n'
                    f'   💾 추가 데이터: {restored_counts.get("data", 0)}개\n'
                    f'📈 총 복구된 레코드: {total_restored}개'
                )
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ 복구 실패: {str(e)}')
            )
            import traceback
            self.stdout.write(traceback.format_exc())
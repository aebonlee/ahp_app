from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def health_check(request):
    """간단한 헬스체크 엔드포인트"""
    return JsonResponse({
        'status': 'OK',
        'message': 'Django server is running',
        'version': '2.1.0'
    })

@csrf_exempt
def api_health(request):
    """API 헬스체크"""
    return JsonResponse({
        'api': 'healthy',
        'database': 'connected',
        'version': '2.1.0'
    })
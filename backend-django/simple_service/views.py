"""
Simple Service Views - 최소한의 API
"""
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import SimpleProject, SimpleData
from .serializers import SimpleProjectSerializer, SimpleDataSerializer


class SimpleProjectViewSet(viewsets.ModelViewSet):
    """간단한 프로젝트 ViewSet"""
    queryset = SimpleProject.objects.all()
    serializer_class = SimpleProjectSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SimpleDataViewSet(viewsets.ModelViewSet):
    """간단한 데이터 ViewSet"""
    queryset = SimpleData.objects.all()
    serializer_class = SimpleDataSerializer


@api_view(['GET'])
def service_status(request):
    """서비스 상태 확인"""
    return Response({
        'message': 'Simple Service is Running',
        'status': 'SUCCESS',
        'projects_count': SimpleProject.objects.count(),
        'data_count': SimpleData.objects.count()
    })
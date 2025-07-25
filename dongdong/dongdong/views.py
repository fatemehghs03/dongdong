from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class HealthCheckView(APIView):
    def post(self, request):
        return Response({"status": "OK!"}, status=status.HTTP_200_OK)

from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from music.models import *
from music import serializers, paginators, perms
from django.shortcuts import get_object_or_404


class UserViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, ]

    def get_queryset(self):
        queries = self.queryset
        if self.request.user.is_authenticated:
            queries = queries.exclude(id=self.request.user.id)

        q = self.request.query_params.get('q')
        if q:
            queries = queries.filter(Q(first_name__icontains=q) |
                                     Q(last_name__icontains=q) |
                                     Q(username__icontains=q))

        return queries

    def get_permissions(self):
        if self.action in ['get_current_user', 'patch_current_user', 'list']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                if k == 'password':
                    user.set_password(v)
                else:
                    setattr(user, k, v)
            user.save()

        return Response(serializers.UserSerializer(user).data)


class GenreViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Genre.objects.filter(active=True).all()
    serializer_class = serializers.GenreSerializer


class SongViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Song.objects.filter(active=True).all()
    serializer_class = serializers.SongSerializer

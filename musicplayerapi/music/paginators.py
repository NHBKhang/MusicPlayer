from rest_framework import pagination
from rest_framework.response import Response


class CommentPaginator(pagination.PageNumberPagination):
    page_size = 5


class SongPaginator(pagination.PageNumberPagination):
    page_size = 10


class PlaylistPaginator(pagination.PageNumberPagination):
    page_size = 10


class UserPaginator(pagination.PageNumberPagination):
    page_size = 10


class CombinedResultsPaginator(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
        })
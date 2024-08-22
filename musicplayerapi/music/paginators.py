from rest_framework import pagination


class CommentPaginator(pagination.PageNumberPagination):
    page_size = 5


class SongPaginator(pagination.PageNumberPagination):
    page_size = 10


class PlaylistPaginator(pagination.PageNumberPagination):
    page_size = 10


class UserPaginator(pagination.PageNumberPagination):
    page_size = 10

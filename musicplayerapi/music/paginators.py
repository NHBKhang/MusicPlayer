from rest_framework import pagination


class CommentPaginator(pagination.PageNumberPagination):
    page_size = 5

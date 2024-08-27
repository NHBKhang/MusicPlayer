from rest_framework import permissions


class CommentOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, comment):
        return super().has_permission(request, view) and request.user == comment.user


class SongOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, song):
        if request.method in permissions.SAFE_METHODS:
            return True

        return song.uploader == request.user


class PlaylistOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, playlist):
        if request.method in permissions.SAFE_METHODS:
            return True

        return playlist.creator == request.user


class PlaylistDetailsPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, playlist_detail):
        if request.method in permissions.SAFE_METHODS:
            return True

        return playlist_detail.playlist.creator == request.user

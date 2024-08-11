from django.contrib import admin
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.html import mark_safe
from music.models import *
from oauth2_provider.models import Application, IDToken, AccessToken, RefreshToken, Grant
import cloudinary


class MyAdminSite(admin.AdminSite):
    site_header = 'SoundScape Administration'
    site_title = 'SoundScape Administration'

    def get_urls(self):
        return [
            path('music_stats/', self.stats_view),
        ] + super().get_urls()

    def stats_view(self, request):
        return TemplateResponse(request, 'admin/stats.html', {
            'stats': ''
        })


admin_site = MyAdminSite(name='musicplayer')


class UserInfoInline(admin.TabularInline):
    model = UserInfo


class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username']
    search_fields = ['id', 'username']
    inlines = [UserInfoInline]


class SongAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'artists', ]
    search_fields = ['id', 'title', 'artists']
    list_filter = ['genres']
    readonly_fields = ['song_cover', 'created_date', 'updated_date']

    def song_cover(self, song):
        if song.image:
            if type(song.image) is cloudinary.CloudinaryResource:
                return mark_safe(f"<img width='300' src='{song.image.url}' />")
            return mark_safe(f"<img width='300' src='/static/{song.image}' />")


class PlaylistDetailsInline(admin.TabularInline):
    model = PlaylistDetails
    extra = 1
    min_num = 1


class PlaylistAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'creator', ]
    search_fields = ['id', 'title', 'creator']
    list_filter = ['genres']
    readonly_fields = ['playlist_cover', 'created_date', 'updated_date']
    inlines = [PlaylistDetailsInline, ]

    def playlist_cover(self, playlist):
        if playlist.image:
            if type(playlist.image) is cloudinary.CloudinaryResource:
                return mark_safe(f"<img width='300' src='{playlist.image.url}' />")
            return mark_safe(f"<img width='300' src='/static/{playlist.image}' />")



admin_site.register(User, UserAdmin)
admin_site.register(Genre)
admin_site.register(Song, SongAdmin)
admin_site.register(Comment)
admin_site.register(Like)
admin_site.register(Stream)
admin_site.register(Playlist)
admin_site.register(PlaylistDetails)
admin_site.register(Follow)
admin_site.register(Transaction)
admin_site.register(Application)
admin_site.register(AccessToken)
admin_site.register(RefreshToken)
admin_site.register(Grant)
admin_site.register(IDToken)

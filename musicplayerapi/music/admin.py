from django.contrib import admin
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.html import mark_safe
from django.utils import timezone
from django.db.models import Count
from django.utils.timezone import now
from music.models import *
from music import utils
from oauth2_provider.models import Application, IDToken, AccessToken, RefreshToken, Grant
import cloudinary


class MyAdminSite(admin.AdminSite):
    site_header = 'SoundScape Administration'
    site_title = 'SoundScape Administration'

    def get_urls(self):
        return [
            path('music_stats/', self.stats_view, name="music-stats"),
            path('stream_stats/', self.stream_stats_view, name="stream-stats"),
            path('revenue_stats/', self.revenue_stats_view, name="revenue-stats"),

        ] + super().get_urls()

    def stats_view(self, request):
        stats = utils.stats()
        return TemplateResponse(request, 'admin/stats.html', {
            'stats': stats,
            'title': 'Statistics Overview'
        })

    def stream_stats_view(self, request):
        month = request.GET.get('month')
        date = request.GET.get('date')

        stats = utils.streams_stats(month=month, date=date)

        today = timezone.now().date()
        max_date = today.strftime('%Y-%m-%d')
        max_month = today.strftime('%Y-%m')

        return TemplateResponse(request, 'admin/stream-stats.html', {
            'stats': stats,
            'title': 'Streams Statistics Overview',
            'current_month': month if month else '',
            'current_date': date if date else '',
            'max_date': max_date,
            'max_month': max_month,
        })

    def revenue_stats_view(self, request):
        month = request.GET.get('month')
        date = request.GET.get('date')

        stats = utils.revenue_stats(month=month, date=date)

        today = timezone.now().date()
        max_date = today.strftime('%Y-%m-%d')
        max_month = today.strftime('%Y-%m')

        return TemplateResponse(request, 'admin/revenue-stats.html', {
            'stats': stats,
            'title': 'Revenue Statistics Overview',
            'current_month': month if month else '',
            'current_date': date if date else '',
            'max_date': max_date,
            'max_month': max_month,
        })


admin_site = MyAdminSite(name='musicplayer')


class UserInfoInline(admin.TabularInline):
    model = UserInfo


class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'get_name']
    search_fields = ['id', 'username']
    inlines = [UserInfoInline]


class SongAccessInline(admin.TabularInline):
    model = SongAccess


class SongAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'artists', 'is_public']
    search_fields = ['id', 'title', 'artists']
    list_filter = ['genres']
    list_editable = ['is_public',]
    readonly_fields = ['song_cover', 'created_date', 'updated_date']
    inlines = [SongAccessInline]

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
admin_site.register(Playlist, PlaylistAdmin)
admin_site.register(PlaylistDetails)
admin_site.register(Follow)
admin_site.register(Transaction)
admin_site.register(MusicVideo)
admin_site.register(Notification)
admin_site.register(LiveStream)
admin_site.register(Application)
admin_site.register(AccessToken)
admin_site.register(RefreshToken)
admin_site.register(Grant)
admin_site.register(IDToken)

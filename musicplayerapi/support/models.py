from music.models import User
from django.db import models


class Feedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    feedback = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Phản hồi của {self.user.get_name()}'


class SupportTicket(models.Model):
    STATUS_CHOICES = [
        (0, 'Open'),
        (1, 'Closed'),
    ]

    PRIORITY_CHOICES = [
        (0, 'Low'),
        (1, 'Medium'),
        (2, 'High'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    subject = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.IntegerField(choices=STATUS_CHOICES, default=0)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=0)

    def __str__(self):
        return f"Ticket #{self.id} - {self.subject} ({self.get_status_display()})"
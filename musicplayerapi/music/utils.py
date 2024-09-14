from django.db.models import Count, Q
from music.models import Genre, Stream, Transaction, Notification
import boto3
import os
import subprocess
from django.conf import settings
from botocore.exceptions import NoCredentialsError, ClientError


def stats():
    return Genre.objects.annotate(counter=Count('songs')).values('id', 'name', 'counter')


def streams_stats(month=None, date=None):
    filter_conditions = Q()

    if month:
        try:
            year, month_number = map(int, month.split('-'))
            filter_conditions &= Q(streamed_at__year=year, streamed_at__month=month_number)
        except ValueError:
            pass

    if date:
        try:
            year, month_number, day_number = map(int, date.split('-'))
            filter_conditions &= Q(streamed_at__year=year, streamed_at__month=month_number, streamed_at__day=day_number)
        except ValueError:
            pass

    streams = Stream.objects.filter(filter_conditions)

    return streams.values('song__title').annotate(counter=Count('id')).order_by('-counter')[:20]


def revenue_stats(month=None, date=None):
    filter_conditions = Q()

    if month:
        try:
            year, month_number = map(int, month.split('-'))
            filter_conditions &= Q(transaction_date__year=year, transaction_date__month=month_number)
        except ValueError:
            pass

    if date:
        try:
            year, month_number, day_number = map(int, date.split('-'))
            filter_conditions &= Q(transaction_date__year=year, transaction_date__month=month_number,
                                   transaction_date__day=day_number)
        except ValueError:
            pass

    transactions = Transaction.objects.filter(filter_conditions, status=Transaction.COMPLETED)

    return transactions.values('song__title', 'amount_in_vnd').order_by('-amount_in_vnd')[:20]

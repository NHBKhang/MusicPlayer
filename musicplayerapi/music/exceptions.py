from rest_framework.exceptions import APIException


class NotDownloadableException(APIException):
    status_code = 403
    default_detail = 'This song is not available for download.'
    default_code = 'not_downloadable'


class PurchaseRequiredException(APIException):
    status_code = 402
    default_detail = 'You need to purchase this song to download it.'
    default_code = 'purchase_required'


class AnonymousException(APIException):
    status_code = 401
    default_detail = "Anonymous users are not allowed to perform this action."
    default_code = "anonymous_error"

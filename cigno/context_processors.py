from django.conf import settings

def resource_urls(request): 
    return dict(
        GEONETWORK_BASE_URL = settings.GEONETWORK_BASE_URL,
    )



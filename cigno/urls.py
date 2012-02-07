from django.conf.urls.defaults import *
from django.conf import settings

from geonode.urls import *

# admin-tools
urlpatterns = patterns('',
                       url(r'^admin_tools/', include('admin_tools.urls')),
                       ) + urlpatterns


urlpatterns += patterns('cigno.metadata.views',
                        url(r'^resource/upload$', 'upload_resource'),
                        (r'^resource/(?P<resourcename>[^/]*)$', 'resourceController'),
                        (r'^resource/(?P<resourceid>[^/]*)/ajax-permissions$', 'ajax_resource_permissions'),
                        )

urlpatterns += patterns('',
                        (r'^tools/', include('cigno.tools.urls')),
                        (r'^mdtools/', include('cigno.mdtools.urls')),
                        (r'^elfinder/', include('elfinder.urls')),
                        url(r'^rosetta/', include('rosetta.urls')),
                        (r'^gemetclient/', 'cigno.metadata.views.gemetclient'),
                        )


# Extra static file endpoint for development use
if settings.SERVE_MEDIA:
    urlpatterns += staticfiles_urlpatterns()

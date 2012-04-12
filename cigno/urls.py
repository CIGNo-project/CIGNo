from django.conf.urls.defaults import *
from django.conf import settings

from geonode.urls import *

# admin-tools
urlpatterns = patterns('',
                       url(r'^admin_tools/', include('admin_tools.urls')),
                       ) + urlpatterns


urlpatterns += patterns('cigno.metadata.views',
                        # url(r'^resource/upload$', 'upload_resource'),
                        (r'^resource/upload$', 'resource_metadata'),
                        (r'^resource/(?P<resourceid>[^/]*)$', 'resource_detail'),
                        (r'^resource/(?P<resourceid>[^/]*)/metadata$', 'resource_metadata'),
                        # override
                        url(r'^layerext/(?P<layername>[^/]*)/metadata$', 'layerext_metadata', name="layerext_metadata"),
                        (r'^resource/(?P<resourceid>[^/]*)/remove$', 'resource_remove'),
                        (r'^resource/(?P<resourceid>[^/]*)/ajax-permissions$', 'ajax_resource_permissions'),
                        (r'^api/(?P<model>[^/]*)/$', 'api'),
                        (r'^api/(?P<model>[^/]*)/(?P<id>[^/]*)/$', 'api'),
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

from django.conf.urls.defaults import *
from django.views.generic.simple import direct_to_template

# General
urlpatterns = patterns('cigno.tools.views',
    (r'^(?:index/?)?$', 'index'),
    (r'^monitoring$', 'monitoring'),
    (r'^upload$', 'upload'),
    (r'^download/(?P<path>.*)$', 'download'),
    (r'^updatelayers/$', 'updatelayers'),
    (r'^updatelayers/(?P<layername>[^/]+)/', 'updatelayers'),
)


# updatelayers                                                                                                                                                                                                
urlpatterns += patterns('',
                        )



from django.conf.urls.defaults import patterns, url

urlpatterns = patterns('cigno.mdtools.views',
    (r'^connect/$', 'connect'),
    (r'^connections/(\w+)/(\w+)/(\d)/$', 'get_connections'),
    (r'^inspire_validator/(?P<uuid>[^/]*)$', 'inspire_validator'),
)

urlpatterns += patterns('cigno.mdtools.views_rdf',
                        (r'^research_areas/(\w+)/$', 'research_areas'),
                        (r'^rdf/relations/$', 'rdfrelations'),
                        (r'^rdf/api/(\w+)/$', 'rdfapi'),
                        (r'^rdf/graph/$', 'graph_connections'),
                        )

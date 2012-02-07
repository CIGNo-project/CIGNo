# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from geonode.maps.models import Layer
from urllib2 import URLError
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required, permission_required, user_passes_test
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
import uuid
from string import lower
import json
import posixpath
import urllib
import os
from django.views.static import was_modified_since
import stat
from django.utils.http import http_date
import mimetypes
from django.utils.encoding import smart_str
from django.conf import settings
import logging

logger = logging.getLogger("cigno.tools.views")


@staff_member_required
def index(request):
    return render_to_response('tools/index.html', RequestContext(request, {"site" : settings.SITEURL}))

@user_passes_test(lambda u: u.is_superuser)
def monitoring(request):
    return render_to_response('tools/monitoring.html', RequestContext(request))

#@staff_member_required
@user_passes_test(lambda u: u.is_superuser)
def upload(request):
    return render_to_response('tools/upload.html', RequestContext(request))

#@staff_member_required
@user_passes_test(lambda u: u.is_superuser)
def download(request, path, document_root=None):
    """
    Modificata di django.views.static.serve per far fare il download da apache

    To use, put a URL pattern such as::

        (r'^xsendfile/(?P<path>.*)$', 'admintools.views.xsendfile', {'document_root' : '/path/to/my/files/'})
        
        return
    la document_root di default e' settings.MEDIA_ROOT + '/' + private
    non e' possibile fare il download di un file esterno alla documento_root
    """
    if document_root is None:
        # document_root = os.path.join(
        #    settings.MEDIA_ROOT, 'private'
        #    )
        document_root = '/opt/geoserver_data/data/'
    # Clean up given path to only allow serving files below document_root.
    path = posixpath.normpath(urllib.unquote(path))
    path = path.lstrip('/')
    newpath = ''
    for part in path.split('/'):
        if not part:
            # Strip empty path components.
            continue
        drive, part = os.path.splitdrive(part)
        head, part = os.path.split(part)
        if part in (os.curdir, os.pardir):
            # Strip '.' and '..' in path.
            continue
        newpath = os.path.join(newpath, part).replace('\\', '/')
    if newpath and path != newpath:
        return HttpResponseRedirect(newpath)
    fullpath = os.path.join(document_root, newpath)
    if os.path.isdir(fullpath):
        #if show_indexes:
        #    return directory_index(newpath, fullpath)
        raise Http404, "Directory indexes are not allowed here."
    if not os.path.exists(fullpath):
        raise Http404, '"%s" does not exist' % fullpath
    # Respect the If-Modified-Since header.
    statobj = os.stat(fullpath)
    if not was_modified_since(request.META.get('HTTP_IF_MODIFIED_SINCE'),
                              statobj[stat.ST_MTIME], statobj[stat.ST_SIZE]):
        return HttpResponseNotModified()
    mimetype = mimetypes.guess_type(fullpath)[0] or 'application/octet-stream'
    
    # non dovrebbe piu' servire perche' si arrangia X-Sendfile di apache
    #contents = open(fullpath, 'rb').read()
    #response = HttpResponse(contents, mimetype=mimetype)
    response = HttpResponse(mimetype=mimetype)
    response["Last-Modified"] = http_date(statobj[stat.ST_MTIME])
    #response["Content-Length"] = len(contents)
    response['Content-Disposition'] = 'attachment; filename="%s"' % os.path.basename(path)
    response['X-Sendfile'] = smart_str(fullpath)
    return response



#@staff_member_required
@user_passes_test(lambda u: u.is_superuser)
def updatelayers(request, layername=None):
    logger.debug('Updatelayers - Start')
    cat = Layer.objects.gs_catalog
    if layername is not None:
        #a.aa
        resource = cat.get_resource(layername)

        try:
            store = resource.store
            workspace = store.workspace

            layer, created = Layer.objects.get_or_create(name=resource.name, defaults = {
                    "workspace": workspace.name,
                    "store": store.name,
                    "storeType": store.resource_type,
                    "typename": "%s:%s" % (workspace.name, resource.name),
                    "title": resource.title or 'No title provided',
                    "abstract": resource.abstract or 'No abstract provided',
                    "uuid": str(uuid.uuid4())
                    })

            if layer.date_type not in Layer.VALID_DATE_TYPES:
                candidate = lower(layer.date_type)
                if candidate in Layer.VALID_DATE_TYPES:
                    layer.date_type = candidate
                else:
                    layer.date_type = Layer.VALID_DATE_TYPES[0]

            layer.save()
            if created: 
                layer.set_default_permissions()
        finally:
            pass

    logger.debug('Updatelayers - start cat.get_resources')
    resources = cat.get_resources()
    logger.debug('Updatelayers - end cat.get_resources')
    layers = []
    for resource in resources:
        logger.debug('Updatelayers - verify %s' % resource.name)
        l = Layer.objects.filter(name=resource.name)
        geonode = False
        if l.count() > 0:
            geonode = True
        
    
        if geonode:
            layers.append({'name': l[0].name, 'title': l[0].title, 'store': l[0].store, 'gn_status': geonode, 'workspace': l[0].workspace})
        else:
            layers.append({'name': resource.name, 'title': resource.title, 'store': resource.store.name, 'gn_status': geonode, 'workspace': resource.store.workspace.name})

    logger.debug('Updatelayers - send response')
    return HttpResponse(json.dumps({'layers': layers}), 
                        mimetype="application/json"
                        #mimetype="text/plain"
                        )

    #return render_to_response('updatelayers_list.html', {'layers': layers})

    # return HttpResponse(
    #     layers,
    #     status=200, 
    #     mimetype="text/plain"
    #     )
            
    


    #for resource in cat.get_resources():
        # # print "geoserver resource %s" % resource.name

    
# @login_required
# def updatelayers(request):
#     try:
#         Layer.objects.slurp()
#     except URLError:
#         HttpResponse(
#         u"Si è verificato un problema nel caricamento dei layer. E' probabile che sia un problema temporaneo: riprovare a ricaricare la pagina.",
#         status=500, 
#         mimetype="text/plain"
#         )
        
#     return HttpResponse(
#         "Tutti i layer sono stati importati",
#         status=200, 
#         mimetype="text/plain"
#         )


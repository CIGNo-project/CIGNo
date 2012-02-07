# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from geonode.maps.models import Layer
from geonode.core.models import AUTHENTICATED_USERS, ANONYMOUS_USERS
from models import  Resource
from urllib2 import URLError
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, get_object_or_404
from django.contrib.auth.models import User
import uuid
from string import lower
import json
from django.core.urlresolvers import reverse
from django.conf import settings
from django.utils import translation
from django.template import RequestContext, loader
from django.views.decorators.csrf import csrf_exempt, csrf_response_exempt, csrf_protect
from django.utils.translation import ugettext as _
from forms import ResourceUploadForm, ResourceForm, ResourceSimpleForm
import os
import re
from urlparse import urlparse


def get_valid_name(resource_name):
    """Create a brand new name
    """
    xml_unsafe = re.compile(r"(^[^a-zA-Z\._]+)|([^a-zA-Z\._0-9]+)")
    name = xml_unsafe.sub("_", resource_name)
    proposed_name = name
    count = 1
    while Resource.objects.filter(name=proposed_name).count() > 0:
        proposed_name = "%s_%d" % (name, count)
        count = count + 1
    return proposed_name

def gemetclient(request):
    output_langs = dict(settings.LANGUAGES).keys()
    return render_to_response('metadata/gemet.html', RequestContext(request, {
                'output_langs': output_langs,
                }))


@login_required
def updatelayers(request, layername=None):
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

    resources = cat.get_resources()
    layers = []
    for resource in resources:
        l = Layer.objects.filter(name=resource.name)
        geonode = False
        if l.count() > 0:
            geonode = True
            
        layers.append({'name': resource.name, 'title': resource.title, 'store': resource.store.name, 'gn_status': geonode, 'workspace': resource.store.workspace.name})


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




######### ex dm app
@login_required
@csrf_exempt
def upload_resource(request):
    if request.method == 'GET':
        return render_to_response('metadata/resource_upload.html',
                                  RequestContext(request, {}))
    elif request.method == 'POST':
        from django.utils.html import escape
        import os, shutil
        form = ResourceUploadForm(request.POST, request.FILES)
        #form = testUploadForm(request.POST, request.FILES)
        tempdir = None
        if form.is_valid():
            saved_resource = form.save(commit=False)
            saved_resource.set_owner(request.user)
            upload_mode = request.POST.get('upload_mode')
            if upload_mode == 'upload':
                name, __ = os.path.splitext(form.cleaned_data["base_file"].name)
                saved_resource.name = get_valid_name(name)
            elif upload_mode == 'link':
                url = urlparse(form.cleaned_data["url_field"])
                saved_resource.name = get_valid_name(url.path or url.netloc)
            saved_resource.save()
            saved_resource.set_default_permissions()
            return HttpResponse(json.dumps({
                        "success": True,
                        #"redirect_to": saved_resource.get_absolute_url() + "?describe"
                        "redirect_to": saved_resource.get_absolute_url()
                        }))
        else:
            errors = []
            for e in form.errors.values():
                errors.extend([escape(v) for v in e])
            return HttpResponse(json.dumps({ "success": False, "errors": errors}))


RESOURCE_LEV_NAMES = {
    Resource.LEVEL_NONE  : _('No Permissions'),
    Resource.LEVEL_READ  : _('Read Only'),
    Resource.LEVEL_WRITE : _('Read/Write'),
    Resource.LEVEL_ADMIN : _('Administrative')
}

from geonode.maps.views import _perms_info_json

@csrf_exempt
@login_required
def _describe_resource(request, resource):
    if request.user.is_authenticated():
        if not request.user.has_perm('metadata.change_resource', obj=resource):
            return HttpResponse(loader.render_to_string('401.html', 
                RequestContext(request, {'error_message': 
                    _("You are not permitted to modify this resource's metadata")})), status=401)
        
        if request.method == "POST":
            resource_form = ResourceSimpleForm(request.POST, instance=resource, prefix="resource")
        else:
            resource_form = ResourceSimpleForm(instance=resource, prefix="resource")

        if request.method == "POST" and resource_form.is_valid():
                the_resource = resource_form.save(commit=False)
                the_resource.save()
                return HttpResponseRedirect("/resource/%s" % resource.pk)

        return render_to_response("metadata/resource_describe.html", RequestContext(request, {
            "layer": resource,
            "resource_form": resource_form,
        }))
    else: 
        return HttpResponse("Not allowed", status=403)

@csrf_exempt
def _remove_resource(request,resource):
    if request.user.is_authenticated():
        if not request.user.has_perm('metadata.delete_resource', obj=resource):
            return HttpResponse(loader.render_to_string('401.html', 
                RequestContext(request, {'error_message': 
                    _("You are not permitted to delete this layer")})), status=401)
        
        if (request.method == 'GET'):
            return render_to_response('metadata/resource_remove.html',RequestContext(request, {
                "resource": resource
            }))
        if (request.method == 'POST'):
            resource.delete()
            return HttpResponseRedirect(reverse("data"))
        else:
            return HttpResponse("Not allowed",status=403) 
    else:  
        return HttpResponse("Not allowed",status=403)


@csrf_exempt
def resourceController(request, resourcename):
    #resource = get_object_or_404(Resource, name=resourcename)
    resource = get_object_or_404(Resource, pk=resourcename)
    if (request.META['QUERY_STRING'] == "describe"):
        return _describe_resource(request,resource)
    if (request.META['QUERY_STRING'] == "remove"):
        return _remove_resource(request,resource)
    if (request.META['QUERY_STRING'] == "update"):
        return _updateResource(request,resource)
    else: 
        if not request.user.has_perm('metadata.view_resource', obj=resource):
            return HttpResponse(loader.render_to_string('401.html', 
                RequestContext(request, {'error_message': 
                    _("You are not permitted to view this resource")})), status=401)
        
        # metadata = resource.metadata_csw()

        # center/zoom don't matter; the viewer will center on the resource bounds

        # estraggo informazioni aggiuntive dalla scheda metadati
        #metadataMetadata = get_object_or_404(Metadata, uuid=resource.uuid)
        metadataMetadata = None
        return render_to_response('metadata/resource.html', RequestContext(request, {
            "layer": resource,
            #"metadata": metadata,
            "permissions_json": _perms_info_json(resource, RESOURCE_LEV_NAMES),
	    }))

def set_resource_permissions(resource, perm_spec):
    if "authenticated" in perm_spec:
        resource.set_gen_level(AUTHENTICATED_USERS, perm_spec['authenticated'])
    if "anonymous" in perm_spec:
        resource.set_gen_level(ANONYMOUS_USERS, perm_spec['anonymous'])
    users = [n for (n, p) in perm_spec['users']]
    resource.get_user_levels().exclude(user__username__in = users + [resource.owner]).delete()
    for username, level in perm_spec['users']:
        user = User.objects.get(username=username)
        resource.set_user_level(user, level)


def ajax_resource_permissions(request, resourceid):
    resource = get_object_or_404(Resource, pk=resourceid)

    if not request.method == 'POST':
        return HttpResponse(
            'You must use POST for editing resource permissions',
            status=405,
            mimetype='text/plain'
        )

    if not request.user.has_perm("metadata.change_resource_permissions", obj=resource):
        return HttpResponse(
            'You are not allowed to change permissions for this resource',
            status=401,
            mimetype='text/plain'
        )

    permission_spec = json.loads(request.raw_post_data)
    set_resource_permissions(resource, permission_spec)

    return HttpResponse(
        "Permissions updated",
        status=200,
        mimetype='text/plain'
    )

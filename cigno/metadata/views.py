# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from geonode.maps.models import Layer
from geonode.core.models import AUTHENTICATED_USERS, ANONYMOUS_USERS
from cigno.metadata.models import  Resource
from urllib2 import URLError
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, get_object_or_404
from django.contrib.auth.models import User
import uuid
from string import lower
import json
import simplejson
from django.core.urlresolvers import reverse
from django.conf import settings
from django.utils import translation
from django.template import RequestContext, loader
from django.views.decorators.csrf import csrf_exempt, csrf_response_exempt, csrf_protect
from django.utils.translation import ugettext as _
from forms import *
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
from models import ALL_LICENSES
from django.core import serializers

def serialize_clean(obj, prefix=None):
    serialized = serializers.serialize("json", [obj])
    obj = simplejson.loads(serialized)[0]['fields']
    if prefix is not None:
        _obj = {}
        for key, value in obj.iteritems():
            _obj['%s-%s' % (prefix, key)] = value
        obj = _obj

    return obj


def initialdata(resource):
    # for r in resource._meta.fields:
    #    value = r.value_to_string(resource)
    #    if value is not None:
    #        # response[r.name] = r.value_to_string(resource)
    #        # response[r.name] = r.value_from_object(resource)
    #        pass
    # serialized = serializers.serialize("json", [resource])
    # initial = simplejson.dumps(simplejson.loads(serialized)[0]['fields'])
    initial = serialize_clean(resource)
    # parent
    for parent in resource._meta.get_parent_list():
        field = resource._meta.get_ancestor_link(parent)
        initial.update(serialize_clean(getattr(resource, field.name)))
    #inline
    for Inline in resource._meta.get_all_related_objects():
        count = 0
        for r in getattr(resource, Inline.get_accessor_name()).all():
            initial.update(serialize_clean(r, '%s-%s' % (Inline.get_accessor_name(), count)))
            count += 1
        initial[Inline.get_accessor_name()] = count
    # # referencedate
    # count = 0
    # for t in  resource.referencedate_set.all():
    #     initial.update(serialize_clean(t, 'referencedate_set-%s' % count))
    #     count += 1
    # initial['referencedate_set'] = count
    # # add temporalextent
    # count = 0
    # for t in  resource.temporalextent_set.all():
    #     initial.update(serialize_clean(t, 'temporalextent_set-%s' % count))
    #     count += 1
    # initial['temporalextent_set'] = count
    # # responsible party
    # count = 0
    # for t in  resource.responsiblepartyrole_set.all():
    #     initial.update(serialize_clean(t, 'responsiblepartyrole_set-%s' % count))
    #     count += 1
    # initial['responsiblepartyrole_set'] = count
    # count = 0
    # for t in  resource.mdresponsiblepartyrole_set.all():
    #     initial.update(serialize_clean(t, 'mdresponsiblepartyrole_set-%s' % count))
    #     count += 1
    # initial['mdresponsiblepartyrole_set'] = count

    # many2many
    initial['topic_category_ext_str'] = ",".join("%s" % tup for tup in resource.topic_category_ext.values_list('id'))
    initial['presentation_form_str'] = ",".join("%s" % tup for tup in resource.presentation_form.values_list('id'))
    initial['distribution_format_str'] = ",".join("%s" % tup for tup in resource.distribution_format.values_list('id'))
    initial['spatial_representation_type_ext_str'] = ",".join("%s" % tup for tup in resource.spatial_representation_type_ext.values_list('id'))
    initial['geonames'] = resource.geonamesGeoJson()
    
    return initial


## override layer_metadata
@csrf_exempt
@login_required
def layerext_metadata(request, layername):
    layer = get_object_or_404(Layer, typename=layername)
    if request.user.is_authenticated():
        if not request.user.has_perm('maps.change_layer', obj=layer):
            return HttpResponse(loader.render_to_string('401.html', 
                RequestContext(request, {'error_message': 
                    _("You are not permitted to modify this layer's metadata")})), status=401)

        if request.method == "POST":
            form = LayerExtForm(request.POST, instance=layer.layerext)
        else:
            # form = LayerExtForm(instance=layer)
            initial = initialdata(layer.layerext)

            return render_to_response('metadata/layerext_metadata.html',
                                      RequestContext(request, { #"formset": formset,
                        'all_licenses': ALL_LICENSES,
                        #'initial': simplejson.dumps(response, cls=DjangoJSONEncoder, indent=4)
                        'initial': simplejson.dumps(initial)
                        }))

        if request.method == "POST" and form.is_valid():
            saved_resource = form.save(commit=False)
            #saved_resource.set_owner(request.user)
            saved_resource.save()
            #saved_resource.set_default_permissions()
            
            save_metadata_related(request, saved_resource)
            
            return HttpResponse(json.dumps({
                        "success": True,
                        #"redirect_to": saved_resource.get_absolute_url() + "?describe"
                        "redirect_to": saved_resource.get_absolute_url()
                        }))
        else:
            errors = []
            for f, e in form.errors.items():
                errors.extend([escape("%s: %s" % (f, v)) for v in e])
            return HttpResponse(json.dumps({ "success": False, "errors": errors}))


from django.utils.html import escape
import os, shutil

@login_required
@csrf_exempt
def resource_metadata(request, resourceid = None):
    resource = None
    if resourceid is not None:
        resource = get_object_or_404(Resource, pk=resourceid)

    if request.user.is_authenticated():
        if resource is not None and not request.user.has_perm('metadata.change_resource', obj=resource):
            return HttpResponse(loader.render_to_string('401.html', 
                                                        RequestContext(request, {'error_message': 
                                                                                 _("You are not permitted to modify this resource's metadata")})), status=401)

    if request.method == 'GET':    
        if resource is not None:
            initial = initialdata(resource)
        else:
            initial = []

        return render_to_response('metadata/resource_metadata.html',
                                  RequestContext(request, { #"formset": formset,
                                                           'all_licenses': ALL_LICENSES,
                                                           #'initial': simplejson.dumps(response, cls=DjangoJSONEncoder, indent=4)
                                                           'initial': simplejson.dumps(initial)
                                                           }))

    elif request.method == 'POST':
        if resource is not None:
            form = ResourceForm(request.POST, request.FILES, instance=resource)
        else:
            form = ResourceForm(request.POST, request.FILES)

        tempdir = None
        if form.is_valid():
            saved_resource = form.save(commit=False)
            if resource is None:
                saved_resource.set_owner(request.user)
            saved_resource.save()
            if resource is None:
                saved_resource.set_default_permissions()
            
            save_metadata_related(request, saved_resource)
            
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

from django.forms.models import modelformset_factory, inlineformset_factory

def save_metadata_related(request, saved_resource):
    # save manytomany
    # form.save_m2m()
    names = ['topic_category_ext', 'presentation_form', 'distribution_format', 'spatial_representation_type_ext']
    for name in names:
        name_str = "%s_str" % name
        value = request.POST.get(name_str, None)
        if value is not None and len(value.strip())>0:
            attr = getattr(saved_resource, name)
            attr.remove(*attr.all())
            attr.add(*value.split(','))

    # save inline
    names = ['temporalextent_set', 'referencedate_set', 'responsiblepartyrole_set', 'mdresponsiblepartyrole_set']
    for Inline in saved_resource._meta.get_all_related_objects():
        if Inline.get_accessor_name() in names:
            InlineFormSet = inlineformset_factory(saved_resource.__class__, Inline.model)
            formset = InlineFormSet(request.POST, request.FILES, instance=saved_resource, prefix=Inline.get_accessor_name())
            if formset.is_valid():
                getattr(saved_resource, Inline.get_accessor_name()).all().delete()
                formset.save()
            else:
                errors = formset.errors

        
    # topic_category_ext_str =  request.POST.get('topic_category_ext_str', None)
    # if topic_category_ext_str is not None and len(topic_category_ext_str.strip())>0:
    #     saved_resource.topic_category_ext.remove(*saved_resource.topic_category_ext.all())
    #     saved_resource.topic_category_ext.add(*topic_category_ext_str.split(','))

    # presentation_form_str =  request.POST.get('presentation_form_str', None)
    # if presentation_form_str is not None and len(presentation_form_str.strip())>0:
    #     saved_resource.presentation_form.remove(*saved_resource.presentation_form.all())
    #     saved_resource.presentation_form.add(*presentation_form_str.split(','))

    # distribution_format_str =  request.POST.get('distribution_format_str', None)
    # if distribution_format_str is not None and len(distribution_format_str.strip())>0:
    #     saved_resource.distribution_format.remove(*saved_resource.distribution_format.all())
    #     saved_resource.distribution_format.add(*distribution_format_str.split(','))

    # spatial_representation_type_ext_str =  request.POST.get('spatial_representation_type_ext_str', None)
    # if spatial_representation_type_ext_str is not None and len(spatial_representation_type_ext_str.strip())>0:
    #     saved_resource.spatial_representation_type_ext.remove(*saved_resource.spatial_representation_type_ext.all())
    #     saved_resource.spatial_representation_type_ext.add(*spatial_representation_type_ext_str.split(','))


    # formset = ResourceReferenceDateInlineFormSet(request.POST, request.FILES, instance=saved_resource, prefix='referencedate_set')
    # if formset.is_valid():
    #     saved_resource.referencedate_set.all().delete()
    #     formset.save()
                
    # formset = ResourceTemporalExtentInlineFormSet(request.POST, request.FILES, instance=saved_resource, prefix='temporalextent_set')
    # if formset.is_valid():
    #     saved_resource.temporalextent_set.all().delete()
    #     formset.save()

    # formset = ResourceResponsiblePartyRoleInlineFormSet(request.POST, request.FILES, instance=saved_resource, prefix='responsiblepartyrole_set')
    # if formset.is_valid():
    #     saved_resource.responsiblepartyrole_set.all().delete()
    #     formset.save()

    # formset = ResourceMdResponsiblePartyRoleInlineFormSet(request.POST, request.FILES, instance=saved_resource, prefix='mdresponsiblepartyrole_set')
    # if formset.is_valid():
    #     saved_resource.mdresponsiblepartyrole_set.all().delete()
    #     formset.save()
    # else:
    #     errors = formset.errors

    # TODO: check for errors
    return True
    

@login_required
@csrf_exempt
def upload_resource(request):
    if  request.user.username == 'menegon' or request.user.username == 'andrea':
        return resource_metadata(request)
    if request.method == 'GET':
        return render_to_response('metadata/resource_upload.html',
                                  RequestContext(request, {}))
    elif request.method == 'POST':
        from django.utils.html import escape
        import os, shutil
        form = ResourceUploadForm(request.POST, request.FILES)
        # form = testUploadForm(request.POST, request.FILES)
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
def resource_remove(request, resourceid):
    resource = get_object_or_404(Resource, pk=resourceid)
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
            return HttpResponseRedirect(reverse("data_search"))
        else:
            return HttpResponse("Not allowed",status=403) 
    else:  
        return HttpResponse("Not allowed",status=403)


def resource_detail(request, resourceid):
    resource = get_object_or_404(Resource, pk=resourceid)
    if not request.user.has_perm('metadata.view_resource', obj=resource):
        return HttpResponse(loader.render_to_string('401.html', 
                                                    RequestContext(request, {'error_message': 
                                                                             _("You are not permitted to view this resource")})), status=401)
        
        # metadata = resource.metadata_csw()

        # center/zoom don't matter; the viewer will center on the resource bounds

        # estraggo informazioni aggiuntive dalla scheda metadati
        #metadataMetadata = get_object_or_404(Metadata, uuid=resource.uuid)
    metadataMetadata = None
    initial = initialdata(resource)
    return render_to_response('metadata/resource.html', RequestContext(request, {
                "md": resource,
                "initial": simplejson.dumps(initial),
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

from models import  *

def _tojson(obj):
    response = obj.__dict__        
    del(response['_state'])
    return response

def api(request, model, id=None):
    if id is not None:
        return _api(request, model, id)
    else:
        return _api_list(request, model)

from django.core.serializers.json import DjangoJSONEncoder
def _api(request, model, id):
    response = {}


    if model=='resource':
        resource = _tojson(Resource.objects.get(pk=id))

    return HttpResponse(simplejson.dumps(response, cls=DjangoJSONEncoder, indent=4), 
                        mimetype="application/json"
                        #mimetype="text/plain"
                        )
    
def _api_list(request, model):
    response = {
        "metaData": {
            "idProperty": "id",
            "root": "rows",
            "totalProperty": "results",
            "successProperty": "success",
            "fields": [
                {"name": "id"},
                {"name": "label"}
                ],
            # used by store to set its sortInfo
            "sortInfo":{
                "field": "label",
                "direction": "ASC"
                },
            # paging data (if applicable)
            # "start": 0,
            # "limit": 2,
            # custom property
            # "foo": "bar"
            },
        # Reader's configured successProperty
        "success": True,
        # Reader's configured totalProperty
        "results": None,
        # Reader's configured root
        # (this data simulates 2 results per page)
        }

    query = request.POST.get('query', None)
    registered_models = {'datetype': CodeDateType,
                         'samplefrequency': CodeSampleFrequency,
                         'responsibleparty': ResponsibleParty,
                         'role': CodeRole,
                         'topiccategory': CodeTopicCategory,
                         'presentationform': CodePresentationForm,
                         'distributionformat': CodeDistributionFormat,
                         'resourcetype': CodeScope,
                         'characterset': CodeCharacterSet,
                         'updatefrequency': CodeMaintenanceFrequency,
                         'spatialrepresentationtype': CodeSpatialRepresentationType,
                         'verticaldatum': CodeVerticalDatum,
                         }

    indent = 4 if request.GET.__contains__('indent') else None
    rows = []
    if model=='language':
        queryset = ALL_LANGUAGES
        for i in queryset:
            label = i[1].__unicode__()
            rows.append({'id': i[0], 'label': label})
    else:
        Model = registered_models[model]
        queryset = Model.objects.all()
        for i in queryset:
            label = i.__unicode__()
            if query is not None and label.lower().find(query.lower())==-1:
                continue
            rows.append({'id': i.pk, 'label': label})
            
        
    response['rows'] = rows
    response['results'] = len(queryset)
    
    # return HttpResponse(json.dumps(response, indent=indent), 
    return HttpResponse(json.dumps(response), 
                        mimetype="application/json"
                        #mimetype="text/plain"
                        )
    

@csrf_exempt
@login_required
def add_responsibleparty(request):
    if request.user.is_authenticated():
        if not request.user.has_perm('metadata.add_responsibleparty'):
            return HttpResponse(loader.render_to_string('401.html', 
                RequestContext(request, {'error_message': 
                    _("You are not permitted to add Responsible Party")})), status=401)

        if request.method == "POST":
            form = ResponsiblePartyForm(request.POST)
        if form.is_valid():
            saved_resource = form.save()
            return HttpResponse(json.dumps({
                        "success": True
                        }))
        else:
            errors = []
            for f, e in form.errors.items():
                errors.extend([escape("%s: %s" % (f, v)) for v in e])
            return HttpResponse(json.dumps({ "success": False, "errors": errors}))

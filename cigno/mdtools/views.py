from django import forms
from models import Connection
from forms import ConnectionForm
from django.shortcuts import render_to_response, get_object_or_404
from django.views.decorators.csrf import csrf_exempt, csrf_response_exempt, csrf_protect
from django.contrib.auth.decorators import login_required
from django.template import RequestContext, loader
from django.contrib.contenttypes.models import ContentType
from django.core import urlresolvers
from django.http import HttpResponseRedirect, HttpResponse
from django.db.models import get_model
import json

from poster.encode import multipart_encode
from poster.streaminghttp import register_openers
import urllib2
from poster.encode import MultipartParam
import StringIO
from owslib.csw import namespaces
from owslib.etree import etree
from owslib import util
from geonode.maps.models import _csw, get_csw

def inspire_validator(request, uuid):
    html = _inspire_validator(uuid)
    return HttpResponse(html)
    
def _inspire_validator(uuid):
    global _csw
    # Check the layer is in the GeoNetwork catalog and points back to get_absolute_url
    if(_csw is None): # Might need to re-cache, nothing equivalent to _wms.contents?
        _csw = get_csw()

    _csw.getrecordbyid([uuid], outputschema=namespaces["gmd"])
    md_metadata = _csw._exml.find('//'+util.nspath('MD_Metadata', namespaces['gmd']))
    body = etree.tostring(md_metadata)
    mp = MultipartParam('dataFile',body,filename='test.xml',filetype='text/xml',filesize=len(body))
    datagen, headers = multipart_encode([mp])
    request = urllib2.Request("http://inspire-geoportal.ec.europa.eu/INSPIREValidatorService/resources/validation/inspire", datagen, headers)
    register_openers()
    response = urllib2.urlopen(request).read()
    return response


@csrf_exempt
@login_required
def connect(request):    
    if request.method == 'POST': # If the form has been submitted...
        form = ConnectionForm(request.POST) # A form bound to the POST data
        #a.aa
        if form.is_valid(): # All validation rules pass
            data = form.cleaned_data
            # avoiding multiple insert
            if Connection.objects.filter(o_content_type = data['o_content_type'],
                                               o_object_id    = data['o_object_id']).count() > 0:
                raise Exception("Cannot insert multiple metadata")
            # create metadata object
            d_class = data['d_content_type'].model_class()
            d_obj = d_class()
            d_obj._populate_from_resource(data['o_content_type'].model_class().objects.get(pk = data['o_object_id']))
            d_obj.save()
            # create mdext object
            instance = form.save(commit=False)
            instance.d_object_id = d_obj.pk
            instance.save()
            return HttpResponseRedirect(urlresolvers.reverse('admin:%s_%s_change' % (d_obj._meta.app_label, 
                                                                                     d_obj._meta.module_name),
                                                             args=(d_obj.pk,)))
        raise Exception("Invalid form %s " % form._errors)
    else:
        raise Exception("Data missing")


def get_connections(request, app_label, model_name, object_id):
    model = get_model(app_label, model_name)
    model_type = ContentType.objects.get_for_model(model)

    return render_to_response('mdtools/connections.html', RequestContext(request, {
                'connections': _get_connections(model_type, object_id),
                }))

def graph_connections(request, app_label=None, model_name=None, object_id=None):
    nodes = {}
    as_origin = Connection.objects.all()
    as_destination = Connection.objects.all()
    for connection in as_origin:
        node_id = "%s%s" % (connection.o_content_object._meta.module_name, connection.o_content_object.pk)
        node_name = unicode(connection.o_content_object)
        d_node_id = "%s%s" % (connection.d_content_object._meta.module_name, connection.d_content_object.pk)
        d_node_name = unicode(connection.d_content_object)
        if not nodes.has_key(node_id):
            nodes[node_id] = {"id": node_id,
                              "name": node_name,
                              "data": { # "$dim": 16.75,
                                       "uuid": connection.o_content_object.uuid,
                                       "url" : connection.o_content_object.get_absolute_url()
                                       },
                              "adjacencies":[]
                              }
        nodes[node_id]["adjacencies"].append(
            {"nodeTo": d_node_id,
             "data": {
                    # "weight": 1
                    }
             }
            )
        ## append destination node
        if not nodes.has_key(d_node_id):
            nodes[d_node_id] = {"id": d_node_id,
                              "name": d_node_name,
                              "data": {# "$dim": 16.75,
                                       "uuid": connection.d_content_object.uuid,
                                       "url" : connection.d_content_object.get_absolute_url()
                                       },
                              "adjacencies":[]
                              }
        nodes[d_node_id]["adjacencies"].append(
            {"nodeTo": node_id,
             "data": {
                    # "weight": 1
                    }
             }
            )
            
    return HttpResponse(json.dumps([v for k, v in nodes.iteritems()], indent = 4))
    #return render_to_response('graph_connections.html', RequestContext(request, {
    #            'nodes': json.dumps([v for k, v in nodes.iteritems()], indent = 4)
    #            }))


    

def _get_connections(model_type, object_id):
    as_origin = Connection.objects.filter(o_content_type__pk=model_type.id,
                                          o_object_id=object_id)
    as_destination = Connection.objects.filter(d_content_type__pk=model_type.id,
                                               d_object_id=object_id)
    connections = {}
    for connection in as_origin:
        ctype = connection.connection_type.code
        robj = connection.d_content_object
        if not connections.has_key(ctype):
            connections[ctype] = []
        connections[ctype].append(robj)
    for connection in as_destination:
        ctype = connection.connection_type.inverse.code
        robj = connection.o_content_object
        if not connections.has_key(ctype):
            connections[ctype] = []
        connections[ctype].append(robj)

    return connections
    

from django import template

from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib import comments
from django.utils.encoding import smart_unicode

from cigno.mdtools.models import Connection
from cigno.mdtools.forms import ConnectionForm
from cigno.mdtools.views import _get_connections
register = template.Library()

#class BaseMetadataExtensionNode(template.Node):


import django.contrib.comments.templatetags.comments as comments_tg


class MdtoolsBaseNode(comments_tg.RenderCommentFormNode):
    def __init__(self, ctype=None, object_pk_expr=None, object_expr=None, as_varname=None, comment=None):
        if ctype is None and object_expr is None:
            raise template.TemplateSyntaxError("Mdtools nodes must be given either a literal object or a ctype and object pk.")
        #self.comment_model = comments.get_model()
        self.as_varname = as_varname
        self.ctype = ctype
        self.object_pk_expr = object_pk_expr
        self.object_expr = object_expr
        #self.comment = comment

    def get_form(self, context):
        ctype, object_pk = self.get_target_ctype_pk(context)
        #user_type.get_object_for_this_type
        return ConnectionForm(initial={'o_content_type': ctype.pk, 'o_object_id': object_pk, 'connection_type': 'mdext'})

    def get_connector(self, context):
        ctype, object_pk = self.get_target_ctype_pk(context)
        a = Connection
        try:
            return Connection.objects.get(o_content_type = ctype,
                                         o_object_id    = object_pk,
                                         connection_type = 'mdext')
        except Connection.DoesNotExist:
            return None

    def render(self, context):
        ctype, object_pk = self.get_target_ctype_pk(context)
        if object_pk:
            connector = self.get_connector(context)
            if connector is None:
                form = self.get_form(context)
            else:
                form = None
            template_search_list = [
                #"comments/%s/%s/form.html" % (ctype.app_label, ctype.model),
                #"comments/%s/form.html" % ctype.app_label,
                "mdtools/box.html"
            ]
            context.push()
            formstr = render_to_string(template_search_list, {"o_ctype": ctype,
                                                              'o_object_id': object_pk,
                                                              'connector': connector,
                                                              "form": form}, context)
            context.pop()
            return formstr
        else:
            return ''
    
class Connections(template.Node):
    def __init__(self, obj):
        self.obj = obj
    def render(self, context):
        context.push()
        formstr = render_to_string('mdtools/connections.html', {"connections": connections,}, context)
        context.pop()
        return formstr
        

def render_connector_box(parser, token):
    return MdtoolsBaseNode.handle_token(parser, token)

def render_connections(parser, token):
    return Connections.handle_token(parser, token)

#register.tag(render_connector_box)
#register.tag(render_connections)

from cigno.mdtools.views_rdf import CignoRDF

import surf
@register.inclusion_tag('mdtools/connections.html')
def render_connections(obj):
    crdf = CignoRDF()
    resource_name = obj.get_absolute_url()
    resource_uri = surf.ns.LOCAL[resource_name]
    resource = crdf.session.get_resource(resource_uri, crdf.CignoResources)
    resource.load()
    # preload 
    rdfresource = {'dcterms_subject': []}
    for k in resource.dcterms_subject:
        rdfresource['dcterms_subject'].append({'subject': k.subject, 'label': k.skos_prefLabel.first})
    return {'rdfresource': rdfresource}

   

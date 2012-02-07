from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic
from django.utils.translation import ugettext_lazy as _

from geonode.maps.models import Layer
from django.db.models import signals
import re

CONNECTION_TYPES = (
    ('mdext', 'Metadata extension'),
)

NODE_TYPES = (
    ('mdext_o', 'Resource'),
    ('mdext_d', 'LayerExt')
)

re_origin = re.compile("_o$")
re_destination = re.compile("_d$")

class ConnectionType(models.Model):
    label            = models.CharField(_('relation'), max_length=255)
    code             = models.CharField(_('relation code'), max_length=100)
    inverse          = models.ForeignKey('self', verbose_name=_('inverse'), null=True, blank=True)
    def __unicode__(self):
        return u"%s" % self.label

class Connection(models.Model):
    o_content_type   = models.ForeignKey(ContentType, related_name="connector_o")
    o_object_id      = models.PositiveIntegerField()
    o_content_object = generic.GenericForeignKey('o_content_type', 'o_object_id')
    d_content_type   = models.ForeignKey(ContentType, related_name="connector_d")
    d_object_id      = models.PositiveIntegerField()
    d_content_object = generic.GenericForeignKey('d_content_type', 'd_object_id')
    connection_type  = models.ForeignKey(ConnectionType)


class MdextConnector(object):
    def __init__(self):
        self._registry = {'mdext_o': {},
                          'mdext_d': {},
                          }
    def get_ctype_pks(self, registry_name):
        pks = []
        for model in self._regitry[registry_name].iterkeys():
            pks.append(ContentType.objects.get_for_model(model))
            return pks
    # , limit_choices_to = {'pk__in': mdtools.get_ctype_pks('mdext_d')}

    def register(self, model, opts):
        for ntype in opts['node_types']:
            self._registry[ntype][model] = opts['node_types']
            setattr(model, '_post_save', True)
            if re_origin.search(ntype):                
                model.add_to_class('mdext_connector_o',generic.GenericRelation(Connection,
                                                                              content_type_field='o_content_type',
                                                                              object_id_field='o_object_id')
                                   )
                if ntype == 'mdext_o':
                    signals.post_save.connect(mdext_post_save_o, sender=model)

            if re_destination.search(ntype):
                model.add_to_class('mdext_connector_d',generic.GenericRelation(Connection,
                                                                              content_type_field='d_content_type',
                                                                              object_id_field='d_object_id')
                                   )
                if ntype == 'mdext_d':
                    signals.post_save.connect(mdext_post_save_d, sender=model)

mdext_connector = MdextConnector()

######## manage mdext connection
def mdext_post_save_o(instance, sender, **kwargs):
    if instance._post_save:
        destinations = instance.mdext_connector_o.all()
        if destinations.count() == 1:
            destination = destinations[0].d_content_object
            destination._populate_from_resource(instance)
            destination._post_save = False
            destination.save()

def mdext_post_save_d(instance, sender, **kwargs):
    if instance._post_save:
        origins = instance.mdext_connector_d.all()
        if origins.count() == 1:
            origin = origins[0].o_content_object
            instance._populate_resource(origin)
            origin._post_save = False
            origin.save()


from django.db.models import signals
from cigno.metadata.models import LayerExt
from geonode.maps.models import Layer

mdext_connector.register(LayerExt, {'node_types': {'mdext_d': True
                                                   },
                                    }
                         )


mdext_connector.register(Layer, {'node_types': {'mdext_o': True,},})

######## manager
from geonode.geonetwork import Catalog as GeoNetwork



#Metadata._post_save = True
#Layer._post_save = True


# def post_save_layer(instance, sender, **kwargs):
#     ###### start copy from maps app
#     instance._autopopulate()
#     instance.save_to_geoserver()

#     if kwargs['created']:
#         instance._populate_from_gs()

#     instance.save_to_geonetwork()

#     if kwargs['created']:
#         instance._populate_from_gn()
#         instance.save(force_update=True)

#     ###### end copy from maps app

#     # verifico se il metadato esiste
#     try:
#         metadata = LayerExt.objects.get(uuid  = instance.uuid)
#     except LayerExt.DoesNotExist:
#         metadata = LayerExt()

#     if instance.NORMAL_SAVE:
#         metadata.titolo = instance.title
#         metadata.uuid  = instance.uuid
#         metadata.descrizione = instance.abstract
#         metadata.info_supplementari = instance.supplemental_information
#         metadata.lingua = instance.language
#         metadata.geographic_bounding_box = instance.geographic_bounding_box
#         metadata.NORMAL_SAVE = False
#         metadata.save()

# signals.post_save.connect(post_save_layer, sender=Layer)

# def post_save_metadata(instance, sender, **kwargs):
#     # i metadati per i layer devo essere gia' presenti
#     # nel modello layer
#     try:
#         layer = Layer.objects.get(uuid  = instance.uuid)
#         if instance.NORMAL_SAVE:
#             layer.title = instance.titolo
#             layer.uuid  = instance.uuid
#             layer.abstract = instance.descrizione
#             layer.keywords = instance.keywords_list_clean()
#             layer.supplemental_information = instance.info_supplementari
#             layer.language = instance.lingua
#             layer.geographic_bounding_box = instance.geographic_bounding_box
#             layer.NORMAL_SAVE = False
#             layer.save()
            
#     except Layer.DoesNotExist:
#         pass

# signals.post_save.connect(post_save_metadata, sender=LayerExt)



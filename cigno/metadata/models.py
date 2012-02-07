# -*- coding: utf-8 -*-

# from django.db import models
from django.conf import settings
from django.contrib.gis.db import models

from django.utils.translation import ugettext_lazy as _
from geonode.maps.models import Layer
from datetime import datetime
from django.db.models import signals

#from filebrowser.fields import FileBrowseField
import simplejson as json
import os
from urlparse import urljoin

from django.contrib.gis.geos import GEOSGeometry

from django.core.urlresolvers import reverse
from geonode.core.models import AUTHENTICATED_USERS, ANONYMOUS_USERS
from django.contrib.contenttypes import generic
from geonode.geonetwork import Catalog as GeoNetwork
import uuid
import extractor
import mimetypes
import httplib2
import surf
import re
from string import lower
from cigno.mdtools.views_rdf import CignoRDF
from django.contrib.auth.models import User, Permission
from geonode.core.models import PermissionLevelMixin
from django.core.exceptions import ValidationError
def create_uuid():
    return str(uuid.uuid4())

from geonode.maps.models import TOPIC_CATEGORIES
from geonode.maps.models import Layer
                                                   

from modeltranslation.settings import DEFAULT_LANGUAGE, AVAILABLE_LANGUAGES
from modeltranslation.utils import build_localized_fieldname, get_language

import logging
from django_extensions.db.fields import json

logger = logging.getLogger("geonode.metadata.models")


ALL_LANGUAGES = (
    ('eng', _('English')),
    ('fra', _('French')),
    ('ita', _('Italian')),
    ('por', _('Portuguese')),
    ('spa', _('Spanish')),
)

METADATA_LANGUAGES = (
    ('eng', _('English')),
    ('ita', _('Italian')),
)


######################################
## Code classes
#######################################
class DcCodeResourceType(models.Model):
    label            = models.CharField(_(u'resource type'), max_length=255)
    dcid            = models.CharField(_('DC identifier'), max_length=100)
    class Meta:
         verbose_name = _(u"DC Resource type")
         verbose_name_plural = _(u"DC Resource types")

    def __unicode__(self):
        return u'%s' % self.label



class CodePresentationForm(models.Model):
    label            = models.CharField(_('presentation form'), max_length=255)
    isoid            = models.CharField(_('ISO identifier'), max_length=100)
    
    class Meta:
         verbose_name_plural = _("Presentation form")
         verbose_name_plural = _("Presentation forms")

    def __unicode__(self):
        return u'%s' % self.label
    
class CodeDistributionFormat(models.Model):
    format                   = models.CharField(_('format'), max_length=255) 
    label                    = models.CharField(_('label'), max_length=255)
    version                  = models.CharField(_('version'), max_length=255, blank=True, null=True)
    mimetype                 = models.CharField(_('mimetype'), max_length=255, blank=True, null=True)
    ordering                 = models.IntegerField(_('ordering'))

    class Meta:
         verbose_name = _("Distribution format")
         verbose_name_plural = _("Distribution formats")
         ordering = ['ordering',]

    def __unicode__(self):
        return u'%s' % self.label
    
class CodeSpatialRepresentationType(models.Model):
    label            = models.CharField(_('type'), max_length=255)
    isoid            = models.CharField(_('ISO identifier'), max_length=100)

    class Meta:
         verbose_name_plural = _("spatial representation type")

    def __unicode__(self):
        return u'%s' % self.label

class CodeTopicCategory(models.Model):
    label            = models.CharField(_('topic category'), max_length=255)
    isoid            = models.CharField(_('ISO identifier'), max_length=100)

    class Meta:
         verbose_name_plural = _("Topic category")
         verbose_name_plural = _("Topic categories")

    def __unicode__(self):
        return u'%s' % self.label

class CodeScope(models.Model):
    label            = models.CharField(_(u'scope'), max_length=255)
    isoid            = models.CharField(_('ISO identifier'), max_length=100)
    class Meta:
         verbose_name = _(u"Scope")
         verbose_name_plural = _(u"Scopes")

    def __unicode__(self):
        return u'%s' % self.label

class CodeRefSys(models.Model):
    label            = models.CharField(_(u'reference system'), max_length=255)
    srid             = models.CharField(_('SRID'), max_length=100, blank=True, null=True)

    class Meta:
         verbose_name = _(u"Reference system")
         verbose_name_plural = _(u"Reference systems")

    def __unicode__(self):
        return u'%s' % self.label


class CodeCharacterSet(models.Model):
    label            = models.CharField(_(u'character set'), max_length=255)
    isoid            = models.CharField(_(u'ISO identifier'), max_length=100)

    class Meta:
         verbose_name_plural = _(u"Character set")

    def __unicode__(self):
        return u'%s' % self.label

class CodeVerticalDatum(models.Model):
    label            = models.CharField(_(u'vertical datum'), max_length=255)

    class Meta:
         verbose_name_plural = _(u"Vertical datum")

    def __unicode__(self):
        return u'%s' % self.label

class CodeMaintenanceFrequency(models.Model):
    label            = models.CharField(_(u'maintenance frequency'), max_length=255)
    isoid            = models.CharField(_('ISO identifier'), max_length=100)
    class Meta:
         verbose_name = _(u"Maintenance frequency")
         verbose_name_plural = _(u"Mintenance frequencies")

    def __unicode__(self):
        return u'%s' % self.label

class CodeRestriction(models.Model):
    label            = models.CharField(_(u'code restriction'), max_length=255)
    isoid            = models.CharField(_('ISO identifier'), max_length=100)
    class Meta:
         verbose_name = _(u"Restriction")
         verbose_name_plural = _(u"Restrictions")

    def __unicode__(self):
        return u'%s' % self.label

class CodeClassification(models.Model):
    label            = models.CharField(_(u'code classification'), max_length=255)
    isoid            = models.CharField(_('ISO identifier'), max_length=100)
    class Meta:
         verbose_name = _(u"Classification")
         verbose_name_plural = _(u"Classifications")

    def __unicode__(self):
        return u'%s' % self.label

class CodeTitle(models.Model):
    label            = models.CharField(_(u'title'), max_length=255)
    class Meta:
         verbose_name = _(u"Title")
         verbose_name_plural = _(u"Titles")

    def __unicode__(self):
        return u'%s' % self.label

class CodeDateType(models.Model):
    label            = models.CharField(_('date type'), max_length=255)
    isoid            = models.CharField(_('ISO identifier'), max_length=100)
    def __unicode__(self):
        return u'%s' % self.label

class CodeRole(models.Model):
    label            = models.CharField(_('role'), max_length=255)
    isoid            = models.CharField(_('ISO identifier'), max_length=100)

    class Meta:
         verbose_name = _(u"Role")
         verbose_name_plural = _(u"Roles")

    def __unicode__(self):
        return u'%s' % self.label


class ResponsibleParty(models.Model):    
    #resp_alias     = models.CharField(_('Alias anagrafica'), max_length=255, 
    #                                  help_text=_(u"Il valore di questo campo verrà utilizzato come descrizione sintetica dell'anagrafica")
    #                                  )
    organization_name    = models.CharField(_('organization name'), max_length=255)
    organization_web     = models.URLField(_('organization web'), null=True, blank=True)
    organization_tel     = models.CharField(_('organization tel'), max_length=255, null=True, blank=True)
    organization_email   = models.EmailField(_('organization email'), null=True, blank=True)
    organization_address = models.CharField(_('organization address'), max_length=255, null=True, blank=True)
    office               = models.CharField(_('office'), max_length=255, null=True, blank=True)
    title                = models.ForeignKey(CodeTitle, verbose_name=_('title'), null=True, blank=True)
    name                 = models.CharField(_('name'), max_length=255)
    surname              = models.CharField(_('surname'), max_length=255)
    tel                  = models.CharField(_('tel'), max_length=255, null=True, blank=True)
    email                = models.CharField(_('email'), max_length=255, null=True, blank=True)


    class Meta:
         verbose_name_plural = _(u"Responsible party")
         ordering = ['organization_name','surname','name']

    def __unicode__(self):
        return u'%s - %s %s' % (self.organization_name, self.surname, self.name)
        #return u'%s' % self.nome_ente



def get_default_scope():
    return CodeScope.objects.get(isoid='dataset')

def get_default_character_set():
    return CodeCharacterSet.objects.get(isoid='utf8')

########################
## Metadata classes
########################
class Inspire(models.Model):
    titleml                        = models.CharField(_('resource title'), max_length=255, help_text="The name given to the resource. Typically, a Title will be a name by which the resource is formally known.")
    abstractml                     = models.TextField(_('resource abstract'), null=True, blank=True, help_text="An account of the content of the resource. Description may include but is not limited to: an abstract, table of contents, reference to a graphical representation of content or a free-text account of the content.")
    supplemental_information_ml     = models.TextField(_('supplemental information'), null=True, blank=True)
    gemetkeywords                   = models.TextField(_('keywords'), null=True, blank=True)    
    resource_type                   = models.ForeignKey(CodeScope, verbose_name=_('hierarchy level'), null=True, blank=True, default=get_default_scope)
    # use relation manager
    # parent_identifier             = models.ForeignKey('self', verbose_name=_('Parent identifier'), null=True, blank=True)
    other_citation_details          = models.TextField(_('other citation details'), null=True, blank=True)
    presentation_form               = models.ManyToManyField(CodePresentationForm, verbose_name=('presentation form'), null=True, blank=True)
    spatial_representation_type_ext = models.ManyToManyField(CodeSpatialRepresentationType, verbose_name=_('spatial representation type'), null=True, blank=True)

    character_set                   = models.ForeignKey(CodeCharacterSet, verbose_name="character set", null=True, blank=True, related_name='%(app_label)s_%(class)s_character_set')
    inspire                         = models.NullBooleanField(_('inspire'), default=True) ## TODO: mettere il default a True
    topic_category_ext              = models.ManyToManyField(CodeTopicCategory, verbose_name=_('topic category'), null=True, blank=True)
    ## section
    vertical_extent_min           = models.FloatField(_(u'vertical extent - minimum value'), null=True, blank=True)
    vertical_extent_max           = models.FloatField(_(u'vertical extent - maximum value'), null=True, blank=True)
    uom_vertical_extent           = models.CharField(_(u'UOM vertical extent'), max_length=50, null=True, blank=True)
    vertical_datum                = models.ForeignKey(CodeVerticalDatum, verbose_name=_('vertical datum'), null=True, blank=True, related_name='%(app_label)s_%(class)s_vertical_datum')
    ## section
    lineage                = models.TextField(_('lineage'), null=True, blank=True, help_text=_("This is a statement on process history and/or overall quality of the spatial data set. Where appropriate it may include a statement whether the data set has been validated or quality assured, whether it is the official version (if multiple versions exist), and whether it has legal validity."))
    equivalent_scale       = models.IntegerField(_('spatail resolution - equivalent scale'), null=True, blank=True)
    distance               = models.IntegerField(_('distance'), null=True, blank=True)
    uom_distance           = models.CharField(_(u'Distance - unit of measure'), max_length=50, null=True, blank=True)
    # TODO: get by geoserver
    ref_sys                = models.ForeignKey(CodeRefSys, verbose_name=_('reference system'), null=True, blank=True, related_name='%(app_label)s_%(class)s_ref_sys')

    ## section
    # TODO: use layer permission
    use_limitation          = models.TextField(_(u'use limitation'), null=True, blank=True)
    access_constraints      = models.ForeignKey(CodeRestriction, verbose_name=_('access constraints'), null=True, blank=True, related_name='%(app_label)s_%(class)s_access_constraints')
    use_constraints        = models.ForeignKey(CodeRestriction, verbose_name=_('use constraints'), null=True, blank=True, related_name='%(app_label)s_%(class)s_user_constraints')
    other_constraints       = models.TextField(_(u'other constraints'), max_length=50, null=True, blank=True)
    security_constraints    = models.ForeignKey(CodeClassification, verbose_name=_('security constraints'), null=True, blank=True)

    ## section
    # override basemetadata distribution_format
    distribution_format    = models.ManyToManyField(CodeDistributionFormat, verbose_name=_(u'distribution format'), null=True, blank=True)    
    update_frequency         = models.ForeignKey(CodeMaintenanceFrequency, verbose_name=_('maintenance frequency'), null=True, blank=True)

    ## section
    md_date_stamp           = models.DateField(_('date'), default = datetime.now)
    ## we are using modeltranslation
    # md_language           = models.CharField(_('language'), max_length=3, choices=METADATA_LANGUAGES, default='ita', help_text=u'Lingua utilizzata per la compilazione del metadato')
    md_uuid                    = models.CharField(_('unique metadata identifier'), max_length=36, default = create_uuid)
    ## TODO: check!!
    # md_parent_uuid         = models.CharField(_('metadata unique resource identifier'), max_length=36)
    md_character_set         = models.ForeignKey(CodeCharacterSet, verbose_name="character set", null=True, blank=True, related_name='%(app_label)s_%(class)s_md_character_set', default=get_default_character_set)
    md_standard_name         = models.CharField(_('metadata standard name'), max_length=100, default='ISO19115')
    md_version_name          = models.CharField(_('metadata version name'), max_length=100, default='2003')

    class Meta:
        abstract = True

    def keywords_list(self):
        if self.gemetkeywords is not None and self.gemetkeywords != '':
            return json.loads(self.gemetkeywords)
        else:
            return []

    def keywords_list_language(self, lang=None):
        if not lang:
            lang = get_language() or DEFAULT_LANGUAGE
        keywords = []
        list = self.keywords_list()
        for k in list:
            keywords.append([k[0][lang], k[1], k[2], k[0][lang].split('>')[-1].strip()])
        return keywords
        
            
    def keywords_list_clean(self, lang=None):
        if not lang:
            lang = get_language() or DEFAULT_LANGUAGE
        keywords = []
        if self.gemetkeywords is not None and self.gemetkeywords != '':
            list = json.loads(self.gemetkeywords)
            for k in list:
                keywords.append(k[0][lang].split('>')[-1].strip())
            return ' '.join(keywords)
        else:
            return ''

    def mldict(self, field_name):
        data = {}
        for lang in AVAILABLE_LANGUAGES:
            localized_field_name = build_localized_fieldname(field_name, lang)
            value = getattr(self, localized_field_name)
            if lang == DEFAULT_LANGUAGE or value:
                data[lang] = value
        return data
    

class ResourceManager(models.Manager):
    def __init__(self, metadata_template = 'metadata/dublin_core.xml'):
        models.Manager.__init__(self)
        self.metadata_template = metadata_template
        # use Layer.objects.gn_catalog instead
        # self.geonetwork = GeoNetwork(settings.GEONETWORK_BASE_URL, settings.GEONETWORK_CREDENTIALS[0], settings.GEONETWORK_CREDENTIALS[1],
        # self.metadata_template
        # )
    # @property
    # def gn_catalog(self):
    #     # check if geonetwork is logged in
    #     if not self.geonetwork.connected:
    #         self.geonetwork.login()
    #     # Make sure to logout after you have finished using it.
    #     return self.geonetwork


class Resource(Inspire, PermissionLevelMixin):
    name                   = models.CharField(max_length=128)
    uuid                   = models.CharField(_('unique resource identifier'), max_length=36, default = create_uuid)
    language               = models.CharField(_('language'), max_length=3, choices=ALL_LANGUAGES, default='ita', blank=True)
    owner                  = models.ForeignKey(User, blank=True, null=True)
    url_field              = models.URLField(blank=True, null=True)
    base_file              = models.FileField(max_length=1024, upload_to='resources/%Y', blank=True, null=True)
    mimetype               = models.CharField(_('mimetype'), max_length=255, blank=True)
    md_creation            = models.DateTimeField(_('Metadata creation'), auto_now_add=True)
    md_last_modify         = models.DateTimeField(_('Metadata last modify'), auto_now=True)
    responsible_party_role  = models.ManyToManyField(ResponsibleParty, through='ResourceResponsiblePartyRole', verbose_name=_(u'responsible party - resource'), related_name="resource_responsible_party_role", null=True, blank=True)
    md_responsible_party_role  = models.ManyToManyField(ResponsibleParty, through='ResourceMdResponsiblePartyRole', verbose_name=_(u'responsible party - metadata'), related_name="resource_md_responsible_party_role", null=True, blank=True)
    topic_category = models.CharField(_('topic_category'), max_length=255, choices = [(x, x) for x in TOPIC_CATEGORIES], default = 'location')
    objects                = ResourceManager()

    # def _populate_from_resource(self, resource):
    #     self.title = resource.title
    #     self.uuid  = resource.uuid
    #     self.abstract = resource.abstract
    #     self.language = resource.language
    
    # def _populate_resource(self, resource):
    #     resource.title = self.title
    #     resource.uuid  = self.uuid
    #     resource.abstract = self.abstract
    #     resource.language = self.language

    @property
    def thumbnail_exists(self):
        if self.base_file.url != '':
            filename = os.path.basename(self.base_file.name)
            return urljoin(self.base_file.url, "resized/%s.png" % filename)
        return None

    def create_thumbnail(self):
        # TODO
        pass

    def delete_from_geonetwork(self):
        gn = Layer.objects.gn_catalog
        gn.delete_layer(self)
        gn.logout()

    # reply layer.layerext access (for metadata)
    @property 
    def layerext(self):
        return self

    @property
    def metadata_links(self):
        if not hasattr(self, "_metadata_links_cache"):
            gn = Layer.objects.gn_catalog
            self._metadata_links_cache = [('text/xml', 'Dublin Core', gn.url_for_uuid(self.uuid, None))]
        return self._metadata_links_cache

    def save_to_geonetwork(self):
        gn = Layer.objects.gn_catalog
        # record = gn.get_by_uuid(self.uuid, None)
        record = gn.get_by_uuid(self.uuid)
        if record is None:
            md_link = gn.create_from_layer(self)
            #self.metadata_links = [("text/xml", "TC211", md_link)]
        else:
            gn.update_layer(self)
        gn.logout()

    # The delete() method does a bulk delete and does not call any
    # delete() methods on your models. It does, however, emit the
    # pre_delete and post_delete signals for all deleted objects
    # (including cascaded deletions).
    #
    # so use signals
    # def save(self, *args, **kwargs):
    #     super(Resource, self).save(*args, **kwargs)
    #     self.save_to_geonetwork()

    # def delete(self, *args, **kwargs):
    #     super(Resource, self).delete(*args, **kwargs)
    #     self.delete_from_geonetwork()

    def __unicode__(self):
        return u"%s" % self.titleml

    def set_owner(self,user):
        self.owner = user

    def get_absolute_url(self):
        # return "/resource/%s" % (self.name,)
        return "/resource/%s" % (self.pk,)

    def clean(self):
        #if (self.mimetype is None or self.mimetype != '') and (self.extract_metadata is not None and self.extract_metadata.get('mimetype') is not None):
        if self.extract_metadata is not None:
            for k,v in self.extract_metadata:
                if k=='mimetype':
                    self.mimetype = v
        if not self.url_field and not self.base_file:
            raise ValidationError('Insert a URL or a file')


    class Meta:
        # custom permissions,
        # change and delete are standard in django
        permissions = (('view_resource', 'Can view'), 
                       ('change_resource_permissions', "Can change permissions"), )

    # Permission Level Constants
    # LEVEL_NONE inherited
    LEVEL_READ  = 'resource_readonly'
    LEVEL_WRITE = 'resource_readwrite'
    LEVEL_ADMIN = 'resource_admin'
                 
    def set_default_permissions(self):
        self.set_gen_level(ANONYMOUS_USERS, self.LEVEL_READ)
        self.set_gen_level(AUTHENTICATED_USERS, self.LEVEL_READ) 

        # remove specific user permissions
        current_perms =  self.get_all_level_info()
        for username in current_perms['users'].keys():
            user = User.objects.get(username=username)
            self.set_user_level(user, self.LEVEL_NONE)

        # assign owner admin privs
        if self.owner:
            self.set_user_level(self.owner, self.LEVEL_ADMIN)

    def download_links(self):
        links = []
        mimetype  = 'unknow'
        extension = 'download'
        if len(self.mimetype) > 0:
            mimetype  = self.mimetype
            extension = mimetypes.guess_extension(self.mimetype).strip('.')
        if self.base_file:
            links.append((extension,extension.upper(),self.base_file.url))
        elif self.url_field: 
            links.append((extension,extension.upper(),self.url_field))
        return links

    @property
    def extract_metadata(self):
        if not hasattr(self, "_extract_metadata_cache"):
            if self.base_file:
                e = extractor.Extractor()
                self._extract_metadata_cache = e.extractFromFile(self.base_file.path.encode())
            elif self.url_field:
                e = extractor.Extractor()
                http = httplib2.Http()
                response, body = http.request(self.url_field)
                self._extract_metadata_cache = e.extractFromData(data=body, size=len(body))
            else:
                self._extract_metadata_cache = None
        return self._extract_metadata_cache

def post_save_resource(instance, sender, **kwargs):    
    logger.debug("POST SAVE titleml %s" % getattr(instance, 'titleml'))
    instance.save_to_geonetwork()

    # save CignoResources in RDF
    resource_uri = surf.ns.LOCAL[instance.get_absolute_url()]
    crdf = CignoRDF()
    if instance.gemetkeywords is not None and instance.gemetkeywords != '':
        gemetkeywords = json.loads(instance.gemetkeywords)
    else:
        gemetkeywords = None
    crdf.add_resource_keywords(resource_uri, 
                               instance.uuid,
                               instance.mldict('titleml'),
                               gemetkeywords
                               )

signals.post_save.connect(post_save_resource, sender=Resource)

def post_delete_resource(instance, sender, **kwargs):
    instance.delete_from_geonetwork()
    
    crdf = CignoRDF()
    crdf.remove(surf.ns.LOCAL[instance.get_absolute_url()])

signals.post_delete.connect(post_delete_resource, sender=Resource)



class LayerExt(Layer, Inspire):
    responsible_party_role  = models.ManyToManyField(ResponsibleParty, through='ResponsiblePartyRole', verbose_name=_(u'responsible party - resource'), related_name="layerext_responsible_party_role", null=True, blank=True)
    md_responsible_party_role  = models.ManyToManyField(ResponsibleParty, through='MdResponsiblePartyRole', verbose_name=_(u'responsible party - metadata'), related_name="layerext_md_responsible_party_role", null=True, blank=True)

    NORMAL_SAVE = True

    @property
    def geographic_bounding_box_geometry(self):
        # è molto strano ma bisogna rimuovere EPSG perché sia un EWKT valido
        try:
            geo = GEOSGeometry(self.geographic_bounding_box.replace('EPSG:',''))
        except ValueError:
            geo = None
        return geo

    # dal template non riesco ad accedere direttamente alle proprietà dell'oggetto srs
    @property
    def srs_name(self):
        bbox = self.geographic_bounding_box_geometry
        if bbox:
            return bbox.srs.name
        return None

    def get_absolute_url(self):
        layer = Layer.objects.get(uuid=self.uuid)
        return layer.get_absolute_url()

 
    def get_edit_url(self):
        return reverse('admin:%s_%s_change' %(self._meta.app_label,  self._meta.module_name),  args=[self.pk] )

    class Meta:
         verbose_name = _(u"Metadata")
         verbose_name_plural = _(u"Metadata")

    def __unicode__(self):
        return u"%s" % self.titleml
    
    def metadata_completeness(self):
        filled = 0
        if self.titleml:
            filled += 1
        if self.abstractml:
            filled += 1
        if self.resource_type_ml:
            filled += 1
        if self.other_citation_details:
            filled += 1
        if self.supplemental_information:
            filled += 1
        if self.presentation_form.all().count() > 0:
            filled += 1
        if self.spatial_representati.all().count() > 0:
            filled += 1
        if self.character_set:
            filled += 1
        if self.topic_category.all().count() > 0:
            filled += 1
        if self.gemetkeywords:
            filled += 1
        if self.vertical_extent_min:
            filled += 1
        if self.vertical_extent_max:
            filled += 1
        if self.uom_vertical_extent:
            filled += 1
        if self.vertical_datum:
            filled += 1
        if self.lineage:
            filled += 1
        if self.equivalent_scale:
            filled += 1
        if self.distance:
            filled += 1
        if self.ref_sys:
            filled += 1
        # if self.responsabile_dati.all().count() > 0:
        #     filled += 1
        # if self.punto_contatto.all().count() > 0:
        #     filled += 1
        # if self.formato_distribuzione.all().count() > 0:
        #     filled += 1
        # if self.distributore.all().count() > 0:
        #     filled += 1
        # if self.responsabile_md.all().count() > 0:
        #     filled += 1

            #return filled
        return  int(100.0 * (filled / 23.0))


    def completeness_bar(self):
        return '<span class="progress-meter" style="display: block; height: 10px; width: 75px; border: 1px solid black"><span class="has-progress" style="display: block; background-color: #0000ff; width: %s%%; height: 100%%"></span></span> %s%%' % (self.metadata_completeness(),self.metadata_completeness())
    completeness_bar.allow_tags = True


    @property
    def field_labels(self):
        d = {}
        for field in self._meta.fields:
            d[field.name] = field.verbose_name.capitalize()
        for field in self._meta.many_to_many:
            d[field.name] = field.verbose_name.capitalize()
        for rel in self._meta.get_all_related_objects():
            d[rel.model._meta.module_name] = unicode(rel.model._meta.verbose_name).capitalize()
        return d

    # def _populate_from_resource(self, resource):
    #     self.supplemental_information = resource.supplemental_information
    #     self.geographic_bounding_box = resource.geographic_bounding_box        

    # def _populate_resource(self, resource):
    #     resource.supplemental_information = self.supplemental_information
    #     resource.geographic_bounding_box = self.geographic_bounding_box
    #     resource.keywords = self.keywords_list_clean()

    # valido il modello: verifico che il primo inserimento di un metadato
    # venga fatto dal modello maps.Layer
    # def clean(self):
    #     from django.core.exceptions import ValidationError
    #     try:
    #         layer = Layer.objects.get(uuid  = self.uuid)
    #     except Layer.DoesNotExist:
    #         raise ValidationError(u"Il primo inserimento di un metadato deve essere effettuato utilizzando la scheda Layer. A breve sarà disponibile l'inserimento di metadati generici utilizzando direttamente questa scheda.")


def post_save_layer(instance, sender, **kwargs):
    if kwargs['created']:
        layerext = LayerExt(layer_ptr=instance)
        for f in instance._meta.local_fields: setattr(layerext, f.name, getattr(instance, f.name))
        # django-modeltranslation http://code.google.com/p/django-modeltranslation/wiki/InstallationAndUsage#Caveats
        # http://code.google.com/p/django-modeltranslation/wiki/InstallationAndUsage#Accessing_translated_and_translation_fields #possible bug or rule 3
        # TODO: get default language from settings
        layerext.titleml_it = instance.title
        layerext.abstractml_it = instance.abstract
        layerext.supplemental_information_ml_it = instance.supplemental_information

        presentation_forms=[
            CodePresentationForm.objects.get(isoid='mapDigital')
            ]
        
        # set distribution format
        if instance.storeType == 'dataStore':
            spatial_representation_types = [
                CodeSpatialRepresentationType.objects.get(isoid='vector')
                ]
            distribution_formats = [
                CodeDistributionFormat.objects.get(format='gml', version='2.0'),
                CodeDistributionFormat.objects.get(format='gml', version='3.1.1'),
                CodeDistributionFormat.objects.get(format='excel', version='97-2003'),
                CodeDistributionFormat.objects.get(format='zip'),
                CodeDistributionFormat.objects.get(format='csv'),
                CodeDistributionFormat.objects.get(format='json'),
                CodeDistributionFormat.objects.get(format='jpeg'),
                CodeDistributionFormat.objects.get(format='png'),
                CodeDistributionFormat.objects.get(format='pdf'),
                CodeDistributionFormat.objects.get(format='kml'),
                ]
        elif instance.storeType == 'coverageStore':
            spatial_representation_types = [
                CodeSpatialRepresentationType.objects.get(isoid='grid')
                ]
            distribution_formats = [
                CodeDistributionFormat.objects.get(format='geotiff'),
                CodeDistributionFormat.objects.get(format='jpeg'),
                CodeDistributionFormat.objects.get(format='png'),
                CodeDistributionFormat.objects.get(format='pdf'),
                CodeDistributionFormat.objects.get(format='kml')            
                ]
        layerext.save()
        layerext.distribution_format.add(*distribution_formats)
        layerext.presentation_form.add(*presentation_forms)
        layerext.spatial_representation_type_ext.add(*spatial_representation_types)
signals.post_save.connect(post_save_layer, sender=Layer)

def post_delete_layerext(instance, sender, **kwargs):
    crdf = CignoRDF()
    crdf.remove(surf.ns.LOCAL[instance.get_absolute_url()])
signals.post_delete.connect(post_delete_layerext, sender=LayerExt)


def post_save_layerext(instance, sender, **kwargs):    
    """
    force save on Layer object: patch to modeltranslation and trigger signals
    """
    if not kwargs['created']:
        a = instance.mldict('titleml')
        instance.layer_ptr.title = a[DEFAULT_LANGUAGE]
        instance.layer_ptr.abstract = instance.mldict('abstractml')[DEFAULT_LANGUAGE]
        instance.layer_ptr.supplemental_information = instance.mldict('supplemental_information_ml')[DEFAULT_LANGUAGE]
        instance.layer_ptr.keywords = instance.keywords_list_clean(DEFAULT_LANGUAGE)
        instance.layer_ptr.save()

    # save CignoResources in RDF
    resource_uri = surf.ns.LOCAL[instance.get_absolute_url()]
    crdf = CignoRDF()
    if instance.gemetkeywords is not None and instance.gemetkeywords != '':
        gemetkeywords = json.loads(instance.gemetkeywords)
    else:
        gemetkeywords = None
    crdf.add_resource_keywords(resource_uri, 
                               instance.uuid,
                               instance.mldict('titleml'),
                               gemetkeywords
                               )
        

signals.post_save.connect(post_save_layerext, sender=LayerExt)


################################ INLINES ##########################
class OnlineResource(models.Model):
    metadata               = models.ForeignKey(LayerExt)
    url                    = models.URLField(max_length=400)

    class Meta:
         verbose_name = _(u"Online resource")
         verbose_name_plural = _(u"Online resources")
    def __unicode__(self):
        return u'%s' % self.url


### converto in tabella
# VALID_DATE_TYPES = [(lower(x), _(x)) for x in ['Creazione', 'Pubblicazione', 'Revisione']]
# VALID_DATE_TYPES = [
#     ('creation','Creazione'), 
#    ('publication', 'Pubblicazione'), 
#    ('revision', 'Revisione')
#    ]

class TemporalExtent(models.Model):
    metadata               = models.ForeignKey(LayerExt)
    temporal_extent_begin  = models.DateField(verbose_name=_('temporal extent - starting date'),blank=True, null=True)
    temporal_extent_end    = models.DateField(verbose_name=_('temporal extent - ending date'),blank=True, null=True)

    def __unicode__(self):
        return u'%s  %s' % (self.temporal_extent_begin, self.temporal_extent_begin)

    class Meta:
         verbose_name_plural = _(u"Temporal extent")

class ResourceTemporalExtent(models.Model):
    metadata               = models.ForeignKey(Resource)
    temporal_extent_begin  = models.DateField(verbose_name=_('temporal extent - starting date'),blank=True, null=True)
    temporal_extent_end    = models.DateField(verbose_name=_('temporal extent - ending date'),blank=True, null=True)

    def __unicode__(self):
        return u'%s  %s' % (self.temporal_extent_begin, self.temporal_extent_begin)

    class Meta:
         verbose_name_plural = _(u"Temporal extent")


class ReferenceDate(models.Model):
    metadata               = models.ForeignKey(LayerExt)
    date                   = models.DateField(blank=True, null=True)
    date_type               = models.ForeignKey(CodeDateType, verbose_name=_('date type'))
    def __unicode__(self):
        return u'%s (%s)' % (self.date, self.date_type)
    class Meta:
         verbose_name = _(u"Reference date")
         verbose_name_plural = _(u"Reference dates")

class ResourceReferenceDate(models.Model):
    metadata               = models.ForeignKey(Resource)
    date                   = models.DateField(blank=True, null=True)
    date_type               = models.ForeignKey(CodeDateType, verbose_name=_('date type'))
    def __unicode__(self):
        return u'%s (%s)' % (self.date, self.date_type)
    class Meta:
         verbose_name = _(u"Reference date")
         verbose_name_plural = _(u"Reference dates")


class Conformity(models.Model):
    metadata              = models.ForeignKey(LayerExt)
    title                 = models.CharField(_('title'), max_length=255)
    date                  = models.DateField(blank=True, null=True)
    date_type             = models.ForeignKey(CodeDateType, verbose_name=_('date type'))
    degree                = models.BooleanField(_('degree'))

    class Meta:
         verbose_name_plural = _(u"Conformity")

class ResourceConformity(models.Model):
    metadata              = models.ForeignKey(Resource)
    title                 = models.CharField(_('title'), max_length=255)
    date                  = models.DateField(blank=True, null=True)
    date_type             = models.ForeignKey(CodeDateType, verbose_name=_('date type'))
    degree                = models.BooleanField(_('degree'))

    class Meta:
         verbose_name_plural = _(u"Conformity")



# class RisorsaWeb(models.Model):
#     metadata               = models.ForeignKey(LayerExt)
#     url                    = models.URLField(max_length=400)

#     class Meta:
#          verbose_name_plural = _(u"Risorse web")
#     def __unicode__(self):
#         return u'%s' % self.url



class ResponsiblePartyRole(models.Model):
    responsible_party = models.ForeignKey(ResponsibleParty)
    metadata = models.ForeignKey(LayerExt)
    role = models.ForeignKey(CodeRole)
    class Meta:
         verbose_name_plural = _(u"Responsible party role")
    def __unicode__(self):
        return "%s (%s)" % (self.responsible_party, self.role)

def get_default_author():
    return CodeRole.objects.get(isoid='author').id

class MdResponsiblePartyRole(models.Model):
    responsible_party = models.ForeignKey(ResponsibleParty)
    metadata = models.ForeignKey(LayerExt)
    role = models.ForeignKey(CodeRole, limit_choices_to = {'isoid': 'author'}, default=get_default_author)
    class Meta:
         verbose_name_plural = _(u"Responsible party role (metadata)")
    def __unicode__(self):
        return "%s (%s)" % (self.responsible_party, self.role)

class ResourceResponsiblePartyRole(models.Model):
    responsible_party = models.ForeignKey(ResponsibleParty)
    metadata = models.ForeignKey(Resource)
    role = models.ForeignKey(CodeRole)
    class Meta:
         verbose_name_plural = _(u"Responsible party role")
    def __unicode__(self):
        return "%s (%s)" % (self.responsible_party, self.role)

class ResourceMdResponsiblePartyRole(models.Model):
    responsible_party = models.ForeignKey(ResponsibleParty)
    metadata = models.ForeignKey(Resource)
    role = models.ForeignKey(CodeRole, limit_choices_to = {'isoid': 'author'}, default=get_default_author)
    class Meta:
         verbose_name_plural = _(u"Responsible party role (metadata)")
    def __unicode__(self):
        return "%s (%s)" % (self.responsible_party, self.role)


# class ResponsabileDatiRuolo(models.Model):
#     anagrafica = models.ForeignKey(Anagrafica)
#     metadata = models.ForeignKey(LayerExt)
#     ruolo = models.ForeignKey(Ruolo)

#     class Meta:
#          verbose_name_plural = _(u"Responsabili dati - ruoli")
#     def __unicode__(self):
#         return "%s (%s)" % (self.anagrafica, self.ruolo)
 
# class PuntoContattoRuolo(models.Model):
#     anagrafica = models.ForeignKey(Anagrafica)
#     metadata = models.ForeignKey(LayerExt)
#     ruolo = models.ForeignKey(Ruolo)

#     class Meta:
#          verbose_name_plural = _(u"Punti contatto - ruoli")
#     def __unicode__(self):
#         return "%s (%s)" % (self.anagrafica, self.ruolo)

# class DistributoreRuolo(models.Model):
#     anagrafica = models.ForeignKey(Anagrafica)
#     metadata = models.ForeignKey(LayerExt)
#     ruolo = models.ForeignKey(Ruolo)

#     class Meta:
#          verbose_name_plural = _(u"Distributori - ruoli")
#     def __unicode__(self):
#         return "%s (%s)" % (self.anagrafica, self.ruolo)


# class ResponsabileMdRuolo(models.Model):
#     anagrafica = models.ForeignKey(Anagrafica)
#     metadata = models.ForeignKey(LayerExt)
#     ruolo = models.ForeignKey(Ruolo)

#     class Meta:
#          verbose_name_plural = _(u"Responsabile metadati - ruoli")
#     def __unicode__(self):
#         return "%s (%s)" % (self.anagrafica, self.ruolo)

# class Allegato(models.Model):
#     metadata = models.ForeignKey(LayerExt)
#     #allegato = FileBrowseField(_("allegato"), max_length=200, blank=True, null=True)
#     allegato = models.FileField(_("allegato"), upload_to = 'metadata/allegati/%Y', max_length=200, blank=True, null=True)
#     descrizione = models.CharField(_('descrizione'), max_length=255, blank=True, null=True)
#     class Meta:
#          verbose_name_plural = _(u"Allegati")


# class Geometria(models.Model):
#     metadata = models.ForeignKey(LayerExt)
#     geo = models.GeometryField()

#     objects = models.GeoManager()

#     class Meta:
#          verbose_name_plural = _(u"Geometrie")
    


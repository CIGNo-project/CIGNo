#from django.contrib import admin
from django.contrib.gis import admin
from modeltranslation.admin import TranslationAdmin, TranslationTabularInline
from django.contrib.contenttypes.generic import GenericTabularInline
from cigno.mdtools.models import Connection
from django.utils.translation import ugettext_lazy as _
from geonode.core.models import UserObjectRoleMapping
from django.http import HttpResponseRedirect


from models import *



# riferimento per resize-fields-in-django-admin
# http://stackoverflow.com/questions/910169/resize-fields-in-django-admin

translation_js = (
    '/static/modeltranslation/js/force_jquery.js',
    'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.2/jquery-ui.min.js',
    '/static/modeltranslation/js/tabbed_translation_fields.js',
    )
translation_css = {
            'screen': ('/static/modeltranslation/css/tabbed_translation_fields.css',),
        }

class ConnectionInline(GenericTabularInline):
    model = Connection
    ct_field = 'o_content_type'
    ct_fk_field = 'o_object_id'

class InverseConnectionInline(GenericTabularInline):
    model = Connection
    ct_field = 'd_content_type'
    ct_fk_field = 'd_object_id'

class OnlineResourceInline(admin.TabularInline):
    model = OnlineResource
    classes = ('collapse closed',)

class TemporalExtentInline(admin.TabularInline):
    model = TemporalExtent
    classes = ('collapse closed',)

class ResourceTemporalExtentInline(admin.TabularInline):
    model = ResourceTemporalExtent
    classes = ('collapse closed',)

class ReferenceDateInline(admin.TabularInline):
    model = ReferenceDate
    classes = ('collapse closed',)

class ResourceReferenceDateInline(admin.TabularInline):
    model = ResourceReferenceDate
    classes = ('collapse closed',)

class ConformityInline(admin.TabularInline):
    model = Conformity
    classes = ('collapse closed',)

class ResourceConformityInline(admin.TabularInline):
    model = ResourceConformity
    classes = ('collapse closed',)

class ResponsiblePartyRoleInline(admin.TabularInline):
    model = ResponsiblePartyRole
    classes = ('collapse closed',)

class ResourceResponsiblePartyRoleInline(admin.TabularInline):
    model = ResourceResponsiblePartyRole
    classes = ('collapse closed',)

class MdResponsiblePartyRoleInline(admin.TabularInline):
    model = MdResponsiblePartyRole
    #exclude = ('role',)
    readonly_fields = ('role',)
    classes = ('collapse closed',)

class ResourceMdResponsiblePartyRoleInline(admin.TabularInline):
    model = ResourceMdResponsiblePartyRole
    #exclude = ('role',)
    readonly_fields = ('role',)
    classes = ('collapse closed',)

class BaseCodeAdmin(TranslationAdmin):
    list_editable = ['label',]
    list_display =  ['id', 'label']
    class Media:
        js = translation_js
        css = translation_css

class BaseCodeIsoAdmin(TranslationAdmin):
    list_editable = ['label','isoid']
    list_display =  ['id', 'label', 'isoid']
    class Media:
        js = translation_js
        css = translation_css

class CodeRefSysAdmin(TranslationAdmin):
    list_editable = ['label', 'srid']
    list_display =  ['id', 'label', 'srid']
    class Media:
        js = translation_js
        css = translation_css

class CodeDistributionFormatAdmin(TranslationAdmin):
    list_editable = ['format','label', 'version', 'mimetype', 'ordering']
    list_display =  ['id', 'format', 'label', 'version', 'mimetype', 'ordering']
    class Media:
        js = translation_js
        css = translation_css

class ResponsiblePartyAdmin(TranslationAdmin):
    # list_editable = ['label', 'version', 'ordering']
    # list_display =  ['id', 'label', 'version', 'ordering']
    class Media:
        js = translation_js
        css = translation_css
    

class LayerExtAdmin(TranslationAdmin):
    # row-level permissions
    # http://www.ibm.com/developerworks/opensource/library/os-django-admin/index.html
    def queryset(self, request):
        qs = super(LayerExtAdmin, self).queryset(request)
        if request.user.is_superuser:
            return qs


        return qs.filter(id__in = UserObjectRoleMapping.objects.filter(user=request.user, 
                                                                       role__codename__in =('layer_readwrite','layer_admin')
                                                                       ).values_list('object_id',flat=True)
                         )

    list_display = ('titleml',)
    inlines = [ # OnlineResourceInline,
               TemporalExtentInline,
               ReferenceDateInline,
               ConformityInline,
               ResponsiblePartyRoleInline,
               MdResponsiblePartyRoleInline,
               # ConnectionInline,
               # InverseConnectionInline,
               ]
    #raw_id_fields = ("parent_identifier",)
    filter_horizontal = ['presentation_form','spatial_representation_type_ext','topic_category_ext','responsible_party_role','distribution_format','md_responsible_party_role']
    # filter_horizontal
    #readonly_fields = ['uuid', 'geographic_bounding_box']
#    readonly_fields = ['uuid', 'md_uuid', 'geographic_bounding_box', 'md_standard_name', 'md_version_name', 'md_character_set']
    search_fields = ['titleml', 'abstractml']
    search_fields_verbose = ['Titolo', 'Descrizione'] #GRAPPELLI
    list_filter = ('resource_type', 'spatial_representation_type_ext', 'topic_category', 'distribution_format')
    list_display = ('id', 'titleml', 'inspire', 'completeness_bar')
    fieldsets = (
        (_('Metadata'), {
                'classes': ('collapse closed',),
                'fields': ( 
                    'md_uuid', 
                    #'lingua_metadata', 
                    'md_date_stamp',
                    ('md_character_set', 'md_standard_name', 'md_version_name')
                    )
                }),
        (_('Identification'), {
                'classes': ('collapse closed',),
                'fields': ( 
                    'titleml', 'abstractml', # 'source_document', # override by resources connections
                    #'resource_type',  'parent_identifier', 'other_citation_details',
                    'other_citation_details',                    
                    'presentation_form',
                    'distribution_format'
                    )
                }),
        (_('Identification2'), {
                'classes': ('collapse closed',),
                'fields': ( 
					('resource_type', 'uuid'),					
                    ('language', 'character_set'),
					'supplemental_information_ml',
					'update_frequency',
					'spatial_representation_type_ext'
                    )
                }),
        (_('Responsible Party'), {
                'classes': ('collapse closed',),
                'fields': []
                }),
        (_('Classification e Keywords'), {
                'classes': ('collapse closed',),
                'fields': ( 
                    'inspire', 'topic_category_ext', 'gemetkeywords'
                    )
                }),
        (_('Geographic extent'), {
                'classes': ('collapse',),
                'fields': ( 
                    ('ref_sys', 'geographic_bounding_box'),  
                    #'geo',
                    ('vertical_datum', 'vertical_extent_min', 'vertical_extent_max', 'uom_vertical_extent') 
                    )
                }),
        (_('Temporal extent'), {
                'classes': ('collapse',),
                'fields': []
                }),
        (_('DataQuality'), {
                'classes': ('collapse closed',),
                'fields': ( 
                    'lineage', ('equivalent_scale', 'distance', 'uom_distance')
                    )
                }),
        (_('Conformity'), {
                'classes': ('collapse closed',),
                'fields': []
                }),
        # ('Distribution', {
        #         'classes': ('collapse closed',),
        #         'fields': (                                   
        #             )
        #         }),
        (_('Constraints'), {
                'classes': ('collapse closed',),
                'fields': ( 
                    'use_limitation', 
                    ('access_constraints', 'use_constraints'),
                    'other_constraints', 
                    'security_constraints', 
                    )
                }),
        # ('Relations', {
        #         'classes': ('collapse closed',),
        #         'fields': []
        #         }),
        #('Sezione sistema - non compilabile', {
        #        'classes': ('collapse closed',),
        #        'fields': ( 
        #            'geonode_tipo_layer',
        #            )
        #        }),
        )
    class Media:
        js = translation_js
        css = translation_css

    def response_change(self, request, obj):
        res = super(LayerExtAdmin, self).response_change(request, obj)
        if request.POST.has_key("_save"):
            return HttpResponseRedirect(obj.get_absolute_url())
        else:
            return res

class ResourceAdmin(TranslationAdmin):
    # row-level permissions
    # http://www.ibm.com/developerworks/opensource/library/os-django-admin/index.html
    def queryset(self, request):
        qs = super(ResourceAdmin, self).queryset(request)
        if request.user.is_superuser:
            return qs


        return qs.filter(id__in = UserObjectRoleMapping.objects.filter(user=request.user, 
                                                                       role__codename__in =('resource_readwrite','resource_admin')
                                                                       ).values_list('object_id',flat=True)
                         )

    list_display = ('titleml',)
    inlines = [ # OnlineResourceInline,
               ResourceTemporalExtentInline,
               ResourceReferenceDateInline,
               ResourceConformityInline,
               ResourceResponsiblePartyRoleInline,
               ResourceMdResponsiblePartyRoleInline,
               # ConnectionInline,
               # InverseConnectionInline,
               ]
    #raw_id_fields = ("parent_identifier",)
    filter_horizontal = ['presentation_form','spatial_representation_type_ext','topic_category_ext','responsible_party_role','distribution_format','md_responsible_party_role']
    # filter_horizontal
    #readonly_fields = ['uuid', 'geographic_bounding_box']
    #readonly_fields = ['uuid', 'md_uuid', 'geographic_bounding_box', 'md_standard_name', 'md_version_name', 'md_character_set']
    readonly_fields = ['uuid', 'md_uuid', 'md_standard_name', 'md_version_name', 'md_character_set']
    search_fields = ['titleml', 'abstractml']
    search_fields_verbose = ['Titolo', 'Descrizione'] #GRAPPELLI
    list_filter = ('resource_type', 'spatial_representation_type_ext', 'topic_category', 'distribution_format')
    list_display = ('id', 'titleml', 'inspire') #, 'completeness_bar')
    list_editable = ['titleml',]
    fieldsets = (
        (_('Metadata'), {
                'classes': ('collapse closed',),
                'fields': ( 
                    'md_uuid', 
                    #'lingua_metadata', 
                    'md_date_stamp',
                    ('md_character_set', 'md_standard_name', 'md_version_name')
                    )
                }),
        (_('Identification'), {
                'classes': ('collapse closed',),
                'fields': ( 
                    'titleml', 'abstractml', # 'source_document', # override by resources connections
                    #'resource_type',  'parent_identifier', 'other_citation_details',
                    'other_citation_details',                    
                    'presentation_form',
                    'distribution_format'
                    )
                }),
        (_('Identification2'), {
                'classes': ('collapse closed',),
                'fields': ( 
					('resource_type', 'uuid'),					
                    ('language', 'character_set'),
					'supplemental_information_ml',
					'update_frequency',
					'spatial_representation_type_ext'
                    )
                }),
        (_('Responsible Party'), {
                'classes': ('collapse closed',),
                'fields': []
                }),
        (_('Classification e Keywords'), {
                'classes': ('collapse closed',),
                'fields': ( 
                    'inspire', 'topic_category_ext', 'gemetkeywords'
                    )
                }),
        (_('Geographic extent'), {
                'classes': ('collapse',),
                'fields': ( 
                    #('ref_sys', 'geographic_bounding_box'),  
                    #'geo',
                    ('vertical_datum', 'vertical_extent_min', 'vertical_extent_max', 'uom_vertical_extent') 
                    )
                }),
        (_('Temporal extent'), {
                'classes': ('collapse',),
                'fields': []
                }),
        (_('DataQuality'), {
                'classes': ('collapse closed',),
                'fields': ( 
                    'lineage', ('equivalent_scale', 'distance', 'uom_distance')
                    )
                }),
        (_('Conformity'), {
                'classes': ('collapse closed',),
                'fields': []
                }),
        # ('Distribution', {
        #         'classes': ('collapse closed',),
        #         'fields': (                                   
        #             )
        #         }),
        (_('Constraints'), {
                'classes': ('collapse closed',),
                'fields': ( 
                    'use_limitation', 
                    ('access_constraints', 'use_constraints'),
                    'other_constraints', 
                    'security_constraints', 
                    )
                }),
        # ('Relations', {
        #         'classes': ('collapse closed',),
        #         'fields': []
        #         }),
        #('Sezione sistema - non compilabile', {
        #        'classes': ('collapse closed',),
        #        'fields': ( 
        #            'geonode_tipo_layer',
        #            )
        #        }),
        )
    class Media:
        js = translation_js
        css = translation_css

    def response_change(self, request, obj):
        res = super(ResourceAdmin, self).response_change(request, obj)
        if request.POST.has_key("_save"):
            return HttpResponseRedirect(obj.get_absolute_url())
        else:
            return res

    
admin.site.register(DcCodeResourceType, BaseCodeAdmin)
admin.site.register(CodeScope, BaseCodeIsoAdmin)
admin.site.register(CodeTopicCategory, BaseCodeIsoAdmin)
admin.site.register(CodePresentationForm, BaseCodeIsoAdmin) 
admin.site.register(CodeSpatialRepresentationType, BaseCodeIsoAdmin)
admin.site.register(CodeRefSys, CodeRefSysAdmin)
admin.site.register(CodeCharacterSet, BaseCodeIsoAdmin)
admin.site.register(CodeVerticalDatum, BaseCodeAdmin)
admin.site.register(CodeMaintenanceFrequency, BaseCodeIsoAdmin)
admin.site.register(CodeRestriction, BaseCodeIsoAdmin)
admin.site.register(CodeClassification, BaseCodeIsoAdmin)
admin.site.register(CodeTitle, BaseCodeAdmin)
admin.site.register(CodeDateType, BaseCodeIsoAdmin)
admin.site.register(CodeRole, BaseCodeIsoAdmin)
admin.site.register(CodeDistributionFormat, CodeDistributionFormatAdmin)

admin.site.register(ResponsibleParty, ResponsiblePartyAdmin)
admin.site.register(LayerExt, LayerExtAdmin)
admin.site.register(Resource, ResourceAdmin)






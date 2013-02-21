# -*- coding: utf-8 -*-
from django import forms
import json
import os
import tempfile
from models import *


supported_format = (".shp", ".tif", ".tiff", ".geotif", ".geotiff")
class JSONField(forms.CharField):
    def clean(self, text):
        text = super(JSONField, self).clean(text)
        try:
            return json.loads(text)
        except ValueError:
            raise forms.ValidationError("this field must be valid JSON")


class ResourceUploadForm(forms.ModelForm):
    #resource_files = ("base_file",)
    class Meta:
        model = Resource
        # TODO: use default language (configure resource_upload.html)
        fields = ('titleml_it', 'abstractml_it', 'url_field', 'base_file')
        #exclude = ('uuid','name')

    ### TODO manage permissions
    #permissions = JSONField()

class ResourceSimpleForm(forms.ModelForm):
    class Meta:
        model = Resource
        fields = ('titleml_it', 'titleml_en', 
                  'abstractml_it', 'abstractml_en',
                  'presentation_form',
                  'gemetkeywords',
                  )

# class ResourceForm(forms.ModelForm):
#     resource_files = ("base_file",)
#     class Meta:
#         model = Resource
#         exclude = ('uuid',)

class ResourceForm(forms.ModelForm):
    resource_files = ("base_file",)
    class Meta:
        model = Resource
        # TODO: use default language (configure resource_upload.html)
        fields = ('type', 'titleml_it', 'titleml_en', 'abstractml_it', 'abstractml_en', 'gemetkeywords', 'base_file',  'url_field', 'use_limitation', 'geographic_bounding_box', 'geonamesids', 'lineage_it' , 'lineage_en', 'equivalent_scale', 'distance', 'uom_distance', 'vertical_datum', 'vertical_extent_min', 'vertical_extent_max', 'uom_vertical_extent', 'other_citation_details_it', 'other_citation_details_en', 'supplemental_information_ml_it', 'supplemental_information_ml_en', 'resource_type', 'language', 'character_set', 'update_frequency', 'spatial_representation_type_ext','license')
        #exclude = ('uuid','name')

    ### TODO manage permissions
    #permissions = JSONField()

class LayerExtForm(forms.ModelForm):
    class Meta:
        model = LayerExt
        # TODO: use default language (configure resource_upload.html)
        fields = ('titleml_it', 'titleml_en', 'abstractml_it', 'abstractml_en', 'gemetkeywords', 'use_limitation', 'geonamesids', 'lineage_it' , 'lineage_en', 'equivalent_scale', 'distance', 'uom_distance', 'vertical_datum', 'vertical_extent_min', 'vertical_extent_max', 'uom_vertical_extent', 'other_citation_details_it', 'other_citation_details_en', 'supplemental_information_ml_it', 'supplemental_information_ml_en', 'resource_type', 'language', 'character_set', 'update_frequency', 'spatial_representation_type_ext','license')
        #exclude = ('uuid','name')

class ResponsiblePartyForm(forms.ModelForm):
    class Meta:
        model = ResponsibleParty
        fields = ('organization_name_it', 'office_it', 'name', 'surname')


# from django.forms.models import modelformset_factory, inlineformset_factory
# ResourceReferenceDateInlineFormSet = inlineformset_factory(Resource, ResourceReferenceDate)
# ResourceTemporalExtentInlineFormSet = inlineformset_factory(Resource, ResourceTemporalExtent)
# ResourceResponsiblePartyRoleInlineFormSet = inlineformset_factory(Resource, ResourceResponsiblePartyRole)
# ResourceMdResponsiblePartyRoleInlineFormSet = inlineformset_factory(Resource, ResourceMdResponsiblePartyRole)


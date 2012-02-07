# -*- coding: utf-8 -*-
from django import forms
import json
import os
import tempfile
from models import Resource


supported_format = (".shp", ".tif", ".tiff", ".geotif", ".geotiff")
class JSONField(forms.CharField):
    def clean(self, text):
        text = super(JSONField, self).clean(text)
        try:
            return json.loads(text)
        except ValueError:
            raise forms.ValidationError("this field must be valid JSON")


class ResourceForm(forms.ModelForm):
    resource_files = ("base_file",)
    class Meta:
        model = Resource
        exclude = ('uuid',)

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

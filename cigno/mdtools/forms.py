from models import Connection
from django import forms

class ConnectionForm(forms.ModelForm):
    class Meta:
        model = Connection
        exclude = ('d_object_id',)

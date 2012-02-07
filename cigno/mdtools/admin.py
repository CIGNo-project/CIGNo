from django.contrib import admin
from modeltranslation.admin import TranslationAdmin, TranslationTabularInline

from models import *

class ConnectionTypeAdmin(TranslationAdmin):
    list_display = ('id', 'label', 'code', 'inverse')
    list_editable = ('label', 'code', 'inverse')
    pass
admin.site.register(ConnectionType,ConnectionTypeAdmin)
admin.site.register(Connection)

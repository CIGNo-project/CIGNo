#from django.contrib import admin
from django.contrib.gis import admin

from models import *


class RisorsaWebInline(admin.TabularInline):
    model = RisorsaWeb
    classes = ('collapse closed',)
     

class AllegatoInline(admin.TabularInline):
    model = Allegato
    classes = ('collapse closed',)

class RiferimentoTemporaleInline(admin.TabularInline):
    model = RiferimentoTemporale

class EstensioneTemporaleInline(admin.TabularInline):
    model = EstensioneTemporale

class ConformitaInline(admin.TabularInline):
    model = Conformita

class ResponsabilDatiRuoloInline(admin.TabularInline):
    model = ResponsabileDatiRuolo

class PuntoContattoRuoloInline(admin.TabularInline):
    model = PuntoContattoRuolo
    classes = ('collapse closed',)

class DistributoreRuoloInline(admin.TabularInline):
    model = DistributoreRuolo

class ResponsabileMdRuoloInline(admin.TabularInline):
    model = ResponsabileMdRuolo

class GeometriaInline(admin.StackedInline):
    model = Geometria

#class MetadataAdmin(admin.ModelAdmin):
from django.contrib.gis.geos import Point
pnt = Point(12.35, 45.43, srid=4326)
pnt.transform(900913)


# riferimento per resize-fields-in-django-admin
# http://stackoverflow.com/questions/910169/resize-fields-in-django-admin

class MetadataAdmin(admin.OSMGeoAdmin):
    default_zoom = 10
    default_lon = pnt.coords[0]
    default_lat = pnt.coords[1]
    inlines = [ResponsabilDatiRuoloInline, 
               PuntoContattoRuoloInline, 
               DistributoreRuoloInline, 
               ResponsabileMdRuoloInline, 
               RisorsaWebInline, 
               RiferimentoTemporaleInline, 
               EstensioneTemporaleInline, 
               ConformitaInline,
               AllegatoInline,
               # GeometriaInline,
               ]
    raw_id_fields = ("id_liv_superiore",)
    filter_horizontal = ['formato_presentazione','tipo_spaziale','argomento','responsabile_dati','punto_contatto','formato_distribuzione','distributore','responsabile_md']
    # filter_horizontal
    #readonly_fields = ['uuid', 'geographic_bounding_box']
    readonly_fields = ['geographic_bounding_box',]
    search_fields = ['titolo', 'descrizione']
    search_fields_verbose = ['Titolo', 'Descrizione'] #GRAPPELLI
    list_filter = ('tipo_risorsa', 'tipo_spaziale', 'argomento', 'formato_distribuzione')
    list_display = ('id', 'titolo', 'inspire', 'completeness_bar')
    fieldsets = (
        ('Sezione Identificazione', {
                #'classes': ('collapse closed',),
                'classes': ('collapse closed',),
                'fields': ( 
                    'titolo', 'descrizione', 'source_document', 
                    'tipo_risorsa',  'id_liv_superiore', 'dettagli',
                    'info_supplementari', 
                    ('lingua', 'set_caratteri'),
					'frequenza_agg',
                    'formato_presentazione', 'tipo_spaziale'
                    )
                }),
        ('Sezione classificazione', {
                'classes': ('collapse closed',),
                'fields': ( 
                    'inspire', 'argomento', 'parole_chiave'
                    )
                }),
        ('Sezione estensione geografica', {
                'classes': ('collapse',),
                'fields': ( 
                    'geographic_bounding_box', 'sist_rif',
                    'geo',
                    ('ext_vert_min', 'ext_vert_max', 'unit_misura', 'datum_verticale') 
                    )
                }),
        ('Sezione estensione temporale', {
                'classes': ('collapse',),
                'fields': []
                }),
        ('Sezione Qualita - Risoluzione spaziale', {
                'classes': ('collapse closed',),
                'fields': ( 
                    'genealogia', ('scala_equival', 'distanza')
                    )
                }),
        ('Sezione Distribuzione', {
                'classes': ('collapse closed',),
                'fields': (                     
                    'formato_distribuzione',                    
                    )
                }),
        ('Sezione Metadati', {
                'classes': ('collapse closed',),
                'fields': ( 
                    'uuid', 
                    'lingua_metadata', 'data_metadato',
                    ('set_caratteri_md', 'standard_md', 'versione_standard_md')
                    )
                }),
        #('Sezione sistema - non compilabile', {
        #        'classes': ('collapse closed',),
        #        'fields': ( 
        #            'geonode_tipo_layer',
        #            )
        #        }),
        )
    
admin.site.register(FormatoPresentazione)
admin.site.register(FormatoDistribuzione)
admin.site.register(TipoSpaziale)
admin.site.register(Argomento)
# admin.site.register(ParolaChiave)
admin.site.register(RiferimentoTemporale)
admin.site.register(EstensioneTemporale)
admin.site.register(Conformita)
admin.site.register(TipoRisorsa)
admin.site.register(SetCaratteri)
admin.site.register(DatumVerticale)
admin.site.register(SistemaRiferimento)
admin.site.register(FrequenzaAggiornamento)
#admin.site.register(GeonodeTipoLayer)
class AnagraficaAdmin(admin.ModelAdmin):
    model = Anagrafica
    list_editable = ['nome_ente', 'sito_web', 'telefono', 'email', 'resp_ufficio', 'resp_titolo', 'resp_nome', 'resp_cognome', 'resp_tel', 'resp_email']
    list_display  = ['resp_alias','nome_ente', 'sito_web', 'telefono', 'email', 'resp_ufficio', 'resp_titolo', 'resp_nome', 'resp_cognome', 'resp_tel', 'resp_email']
admin.site.register(Anagrafica, AnagraficaAdmin)
admin.site.register(Ruolo)
admin.site.register(Titolo)

#admin.site.register(Metadata, MetadataAdmin)

admin.site.register(Metadata, MetadataAdmin)


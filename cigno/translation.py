from modeltranslation.translator import translator, TranslationOptions
from cigno.metadata.models import *
from cigno.mdtools.models import ConnectionType
# from cigno.test_multilingual.models import News, CodeType

########## app maps ########################
# bug on modeltranslation from inherit models
# from geonode.maps.models import Layer
# class LayerTranslationOptions(TranslationOptions):
#     fields = ('title', 'abstract', 'supplemental_information')

# translator.register(Layer, LayerTranslationOptions)

########## app metadata ######################
class LayerExtTranslationOptions(TranslationOptions):
    fields = ('titleml', 'abstractml', 'lineage', 'other_citation_details', 'supplemental_information_ml', 'use_limitation', 'other_constraints')

class ResourceTranslationOptions(TranslationOptions):
    fields = ('titleml', 'abstractml', 'lineage', 'other_citation_details', 'supplemental_information_ml', 'use_limitation', 'other_constraints')

class BaseCodeTranslationOptions(TranslationOptions):
    fields = ('label',)

class ResponsiblePartyTranslationOptions(TranslationOptions):
    fields = ('organization_name', 'office')


translator.register(DcCodeResourceType, BaseCodeTranslationOptions)
translator.register(CodeScope, BaseCodeTranslationOptions)
translator.register(CodeTopicCategory, BaseCodeTranslationOptions)
translator.register(CodePresentationForm, BaseCodeTranslationOptions)
translator.register(CodeSpatialRepresentationType, BaseCodeTranslationOptions)
translator.register(CodeRefSys, BaseCodeTranslationOptions)
translator.register(CodeCharacterSet, BaseCodeTranslationOptions)
translator.register(CodeVerticalDatum, BaseCodeTranslationOptions)
translator.register(CodeMaintenanceFrequency, BaseCodeTranslationOptions)
translator.register(CodeSampleFrequency, BaseCodeTranslationOptions)
translator.register(CodeRestriction, BaseCodeTranslationOptions)
translator.register(CodeClassification, BaseCodeTranslationOptions)
translator.register(CodeTitle, BaseCodeTranslationOptions)
translator.register(CodeDateType, BaseCodeTranslationOptions)
translator.register(CodeRole, BaseCodeTranslationOptions)
translator.register(CodeDistributionFormat, BaseCodeTranslationOptions)


translator.register(ResponsibleParty, ResponsiblePartyTranslationOptions)

translator.register(LayerExt, LayerExtTranslationOptions)

translator.register(Resource, ResourceTranslationOptions)

translator.register(ConnectionType, BaseCodeTranslationOptions)

############ test
class NewsTranslationOptions(TranslationOptions):
    fields = ('title', 'text',)

class TypeTranslationOptions(TranslationOptions):
    fields = ('label',)


# translator.register(News, NewsTranslationOptions)
# translator.register(CodeType, TypeTranslationOptions)



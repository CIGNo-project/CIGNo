# -*- coding: utf-8 -*-
# Django settings for CIGNo project.
import geonode
from geonode.settings import *

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
GEONODE_ROOT = os.path.dirname(geonode.__file__)

ROOT_URLCONF = 'cigno.urls'

# required by django-admin-tools
TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.contrib.messages.context_processors.messages',
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.request",
    "geonode.maps.context_processors.resource_urls",
    # "django.core.context_processors.auth",
    # "django.core.context_processors.debug",
    # "django.core.context_processors.i18n",
    # "django.core.context_processors.media",
    # "geonode.maps.context_processors.resource_urls",
    # # django 1.2 only
    # 'django.contrib.messages.context_processors.messages',
    # # required by django-admin-tools
    # 'django.core.context_processors.request',
    # # CIGNo
    # "cigno.context_processors.resource_urls",
    )

INSTALLED_APPS = (
    # cigno - required by admin-tools
    #'admin_tools',
    #'admin_tools.theming',
    #'admin_tools.menu',
    #'admin_tools.dashboard',
    # geonode
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.admin',
    'django.contrib.sitemaps',
    'django.contrib.staticfiles',
    'django.contrib.messages',

    'django_extensions',
    'registration',
    'profiles',
    'avatar',
    'dialogos',
    'agon_ratings',
    'taggit',
    'south',

    'geonode.core',
    'geonode.maps',
    'geonode.proxy',
    'geonode',
    # cigno
    #'elfinder',
    'cigno.tools',
    'cigno.metadata',
    'cigno.mdtools',
    'cigno',
    'modeltranslation',
    'rosetta',
    'mediagenerator',
#    'cigno.aisstat',
)

MODELTRANSLATION_TRANSLATION_REGISTRY = "cigno.translation"
MODELTRANSLATION_DEFAULT_LANGUAGE = 'it'

TEMPLATE_DIRS = (
  os.path.join(PROJECT_ROOT,"templates"),
  os.path.join(GEONODE_ROOT,"templates"),
  os.path.join(GEONODE_ROOT,".."),
)

ELFINDER = {'root': '/var/lib/geoserver/geonode-data/',
            'URL': SITEURL + "tools/download/",
            # 'archiveMimes': ['zip'],
            }

# ADMIN_TOOLS_MEDIA_URL = SITEURL + 'media/static/'
ADMIN_TOOLS_MENU = 'cigno.menu.CustomMenu'
ADMIN_TOOLS_THEMING_CSS = 'cigno/css/admin_tools.css'

ADMIN_TOOLS_INDEX_DASHBOARD = 'cigno.dashboard.CustomIndexDashboard'
ADMIN_TOOLS_APP_INDEX_DASHBOARD = 'cigno.dashboard.CustomAppIndexDashboard'


try:
    from local_settings import *
except ImportError:
    pass

# mediagenerator
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))


ROOT_MEDIA_FILTERS = {
    'js': 'mediagenerator.filters.yuicompressor.YUICompressor',
    'css': 'mediagenerator.filters.yuicompressor.YUICompressor',
}

YUICOMPRESSOR_PATH = '/usr/share/yui-compressor/yui-compressor.jar'

MEDIA_DEV_MODE = DEBUG
DEV_MEDIA_URL = '/devmedia/'
PRODUCTION_MEDIA_URL = '/static/cigno/'

#GLOBAL_MEDIA_DIRS = (os.path.join(os.path.dirname(__file__), 'static'),)

MEDIA_BUNDLES = (
    ('cigno.js',
     'cigno/externals/dynform/Ext.form.Field.js',
     'cigno/externals/dynform/Ext.form.FieldSet.js',
     'cigno/externals/dynform/Ext.form.FormPanel.js',
     'cigno/externals/ext/examples/ux/Spinner.js',
     'cigno/externals/ext/examples/ux/SpinnerField.js',
     'cigno/externals/ext/examples/ux/MultiSelect.js',
     'cigno/externals/ext/examples/ux/ItemSelector.js',
     'cigno/externals/gemetclient/build/GemetClient.js',
     'cigno/js/GemetPanel.js',
     'cigno/externals/GeoExt.ux/GeoNamesSearchCombo.js',
     'cigno/js/BboxGeoNamesPanel.js',
     'cigno/js/RelationsManager.js',
     'cigno/js/ResourceForm.js',
     'cigno/externals/jit/js/jit-yc.js',
     'cigno/js/SOSClient.js'
    ),
    ('cigno.css',
     'cigno/externals/ext/examples/ux/css/Spinner.css',
     'cigno/externals/ext/examples/ux/css/MultiSelect.css'
     )

)


# -*- coding: utf-8 -*-
# Django settings for CIGNo project.
import geonode
from geonode.settings import *

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
GEONODE_ROOT = os.path.dirname(geonode.__file__)

ROOT_URLCONF = 'cigno.urls'

# required by django-admin-tools
TEMPLATE_CONTEXT_PROCESSORS += [
    # django 1.2 only
    'django.contrib.messages.context_processors.messages',
    # required by django-admin-tools
    'django.core.context_processors.request',
    ]

INSTALLED_APPS = (
    # cigno - required by admin-tools
    'admin_tools',
    'admin_tools.theming',
    'admin_tools.menu',
    'admin_tools.dashboard',
    # geonode
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.admin',
    'django.contrib.sitemaps',
    'staticfiles',
    'django_extensions',
    'registration',
    'profiles',
    'avatar',
    'geonode.core',
    'geonode.maps',
    'geonode.proxy',
    'geonode',
    # cigno
    'elfinder',
    'cigno.tools',
    'cigno.metadata',
    'cigno.mdtools',
    'cigno',
    'modeltranslation',
    'rosetta'
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


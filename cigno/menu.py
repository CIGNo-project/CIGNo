"""
This file was generated with the custommenu management command, it contains
the classes for the admin menu, you can customize this class as you want.

To activate your custom menu add the following to your settings.py::
    ADMIN_TOOLS_MENU = 'cigno.menu.CustomMenu'
"""

from django.core.urlresolvers import reverse
from django.utils.translation import ugettext_lazy as _

from admin_tools.menu import items, Menu


class CustomMenu(Menu):
    """
    Custom Menu for cigno admin site.
    """
    def __init__(self, **kwargs):
        Menu.__init__(self, **kwargs)
        self.children += [
            items.MenuItem(_('Home'), reverse('geonode.views.index')),
            items.MenuItem(_('Data'), reverse('geonode.maps.views.search_page')),
            items.MenuItem(_('Maps'), reverse('geonode.maps.views.maps')),
            items.MenuItem(_('Tools'), reverse('cigno.tools.views.index')),
            items.MenuItem(_('Admin'), reverse('admin:index')),
            items.Bookmarks(),
            items.AppList(
                _('Applications'),
                exclude=('django.contrib.*',)
            ),
            items.AppList(
                _('Administration'),
                models=('django.contrib.*',)
            )
        ]

    def init_with_context(self, context):
        """
        Use this method if you need to access the request context.
        """
        return super(CustomMenu, self).init_with_context(context)

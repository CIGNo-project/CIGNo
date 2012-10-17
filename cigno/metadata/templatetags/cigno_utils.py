# http://djangosnippets.org/snippets/2444/

from django import template
from django.template.defaultfilters import stringfilter
from django.utils.safestring import mark_safe

register = template.Library()

import html5lib
from html5lib import sanitizer

@register.filter
@stringfilter
def sanitize(value):
    p = html5lib.HTMLParser(tokenizer=sanitizer.HTMLSanitizer)
    return mark_safe(p.parseFragment(value).toxml())


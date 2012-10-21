from tempfile import mkdtemp
import simplejson
from django.http import HttpResponse, HttpResponseNotModified
import rdflib
import surf
from cigno.mdtools.utils_rdf import get_rdflib_store, serialize_store
from surf.query import a, select, construct, union, group, optional_group
from django.conf import settings
import os
from surf.rdf import Literal, URIRef
from django.views.decorators.csrf import csrf_exempt
from urllib import urlencode
from django.core.urlresolvers import reverse
from geonode.maps.models import Layer
import logging
from django.contrib.auth.decorators import login_required
from django.utils.text import truncate_words
import re

logger = logging.getLogger("cigno.mdtools.views_rdf")

# register the namespace
surf.ns.register(gemet="http://www.eionet.europa.eu/gemet/2004/06/gemet-schema.rdf#")
surf.ns.register(cigno="http://www.corila.it/cigno/cigno-schema.rdf#")
surf.ns.register(cignos="http://www.corila.it/cigno/")
surf.ns.register(gmd="http://www.isotc211.org/2005/gmd/")
surf.ns.register(gn="http://www.geonames.org/ontology#")
surf.ns.register(gnfeatures="http://sws.geonames.org/")
surf.ns.register(local=settings.SITEURL.rstrip('/'))

supported_relations = ['http://purl.org/dc/terms/hasPart',
                       'http://purl.org/dc/terms/isPartOf',
                       'http://purl.org/dc/terms/references',
                       'http://purl.org/dc/terms/isReferencedBy',
                       'http://purl.org/dc/terms/relation'
                       ]  
reverse_relations = {"http://purl.org/dc/terms/hasVersion": "http://purl.org/dc/terms/isVersionOf",
                     "http://purl.org/dc/terms/replaces": "http://purl.org/dc/terms/isReplacedBy",
                     "http://purl.org/dc/terms/requires": "http://purl.org/dc/terms/isRequiredBy",
                     "http://purl.org/dc/terms/hasPart": "http://purl.org/dc/terms/isPartOf",
                     "http://purl.org/dc/terms/references": "http://purl.org/dc/terms/isReferencedBy",
                     "http://purl.org/dc/terms/hasFormat": "http://purl.org/dc/terms/isFormatOf",
                     'http://purl.org/dc/terms/relation': 'http://purl.org/dc/terms/relation'
                     }
reverse_relations.update(dict((v,k) for k, v in reverse_relations.iteritems()))
cigno_r = surf.ns.CIGNO['Resource']
cigno_ra = surf.ns.CIGNO['ResearchArea']
cigno_ras = surf.ns.CIGNO['ResearchAreas']
gemet_sg = surf.ns.GEMET['SuperGroup']
gemet_g = surf.ns.GEMET['Group']
gemet_t = surf.ns.GEMET['Theme']
member = surf.ns.SKOS['member']
skos_c = surf.ns.SKOS['Concept']

def sanitize_sparql(sparql):
  _sparql = re.sub(r'{\s*{\s*{', '{ {', sparql)
  __sparql = re.sub(r'}\s*}\s*}', '} }', _sparql)
  return re.sub(r'}\s*}\s*UNION\s*{\s*{', '} UNION {', __sparql) 

def save_graph():
  serialize_store(os.path.join(settings.PROJECT_ROOT,"stores","rdfstore"), os.path.join(settings.PROJECT_ROOT,"stores","rdfstore.rdf"))

def reload_graph():
  store = get_rdflib_store(os.path.join(settings.PROJECT_ROOT,"stores","rdfstore"), False)
  store.load_triples(source=os.path.join(settings.PROJECT_ROOT,"stores","rdfstore.rdf"))


class CignoRDF(object):
  def __init__(self):
    # init RDF session
    self.store = get_rdflib_store(os.path.join(settings.PROJECT_ROOT,"stores","rdfstore"))
    self.session = surf.Session(self.store, auto_persist=True, auto_load=True)
    # init RDF classes
    self.CignoResources = self.session.get_class(surf.ns.CIGNO['Resource'])
    self.Concepts = self.session.get_class(surf.ns.SKOS['Concept'])
    self.Properties = self.session.get_class(surf.ns.RDF['Property'])
    self.Relations = self.Properties.get_by(rdfs_subPropertyOf = surf.ns.DCTERMS['relation'])
    self.Collections = self.session.get_class(surf.ns.SKOS['Collection'])
    self.ResearchAreas = self.session.get_class(surf.ns.CIGNO['ResearchArea'])
    self.GeoNames = self.session.get_class(surf.ns.GN['Feature'])
  def close(self):
    # self.store.close()
    self.session.commit()
    # cannot use session.close due a bug
    # cannot modify a dictionary while iterating over it
    #self.session.close()
    for store in self.session._Session__stores.keys():
      self.session._Session__stores[store].close()
      del self.session._Session__stores[store]
    self.session.mapping = None
  def __del__(self):
    pass
    self.close()

  def remove(self, s):
    s = URIRef(s) if  not isinstance(s, URIRef) else s
    self.store.remove_triple(s, None, None)
    self.store.remove_triple(None, None, s)
    
  def add_resource_keywords(self, resource_uri, uuid, resource_labels = None, keywords = None):
    resource = self.session.get_resource(resource_uri, self.CignoResources)
    resource.rdfs_label = [] # clean
    for lang in resource_labels.keys(): 
       resource.rdfs_label.append(Literal(resource_labels[lang], lang))
    resource.cigno_uuid=Literal(uuid)
    resource.dcterms_subject = [] # clean
    if keywords and keywords != '':
      for k in keywords:
        resource.dcterms_subject.append(self.Concepts(k[1]))
    resource.save()

  def add_triple(self, s, p, o):
    s = URIRef(s) if  not isinstance(s, URIRef) else s
    p = URIRef(p) if  not isinstance(p, URIRef) else p
    o = URIRef(o) if  not isinstance(o, URIRef) else o
    self.store.add_triple(s, p, o)
    self.store.save()

  def get_where_tree(self, res):
    # if res.subject == rdflib.term.URIRef('http://www.corila.it/cigno/researchareas/'):
    if cigno_ras in res.rdf_type:
      where1 = [("?s", a, surf.ns.CIGNO['Resource']),
               ("?s", surf.ns.DCTERMS['subject'], "?key"),
               ("?cc", member, "?key"),
               ("?c", member, "?cc"),
               (res.subject, member, "?c")]
      where2 = [("?s", a, surf.ns.CIGNO['Resource']),
               ("?s", surf.ns.DCTERMS['subject'], "?key"),
               ("?c", member, "?key"),
               (res.subject, member, "?c")]
      where = [union(group(*where1),group(*where2))]
    elif cigno_ra in res.rdf_type:
      where1 = [("?s", a, surf.ns.CIGNO['Resource']),
               ("?s", surf.ns.DCTERMS['subject'], "?key"),
               ("?c", member, "?key"),
               (res.subject, member, "?c")
               ]
      where2 = [("?s", a, surf.ns.CIGNO['Resource']),
               ("?s", surf.ns.DCTERMS['subject'], "?c"),
               (res.subject, member, "?c")
               ]
      where = [union(group(*where1),group(*where2))]
    elif res.subject == rdflib.term.URIRef('http://www.eionet.europa.eu/gemet/supergroup/'):
      where = [("?s", a, surf.ns.CIGNO['Resource']),
               ("?s", surf.ns.DCTERMS['subject'], "?key"),
               ("?cc", member, "?key"),
               ("?c", member, "?cc"),
               (res.subject, member, "?c")
               ]
    elif gemet_sg in res.rdf_type:
      where = [("?s", a, surf.ns.CIGNO['Resource']),
               ("?s", surf.ns.DCTERMS['subject'], "?key"),
               ("?c", member, "?key"),
               (res.subject, member, "?c")]
    elif gemet_g in res.rdf_type:
      # key = child
      where = [("?s", a, cigno_r),
               ("?s", surf.ns.DCTERMS['subject'], "?c"),
               (res.subject, member, "?c")
               ]
    elif gemet_t in res.rdf_type:
      # key = child
      where = [("?s", a, cigno_r),
               ("?s", surf.ns.DCTERMS['subject'], "?c"),
               (res.subject, member, "?c")
               ]
    elif skos_c in res.rdf_type:
      where = [("?s", a, cigno_r),
               ("?s", surf.ns.DCTERMS['subject'], res.subject)
               ]
    return where

  def get_not_empty_members(self, res):
    where = self.get_where_tree(res)
    query = select("?c").where(*where).distinct()
    querys = sanitize_sparql("%s" % query)
    result = self.session.default_store.execute_sparql(querys)
    return result['results']['bindings']
    #return query

  def get_resources_by_classification(self,res):
    # s = s if isinstance(s, URIRef) else URIRef(s)
    where = [("?s", surf.ns.RDF['type'], surf.ns.CIGNO['Resource'])
             ]

    if surf.ns.CIGNO['ResearchArea'] in res.rdf_type:
      where1 = [("?s", surf.ns.RDF['type'], surf.ns.CIGNO['Resource']),
               ("?s", surf.ns.DCTERMS['subject'], "?key"),
               ("?theme", member, "?key"),
               (res.subject, member, "?theme")
               ]
      where2 = [("?s", surf.ns.RDF['type'], surf.ns.CIGNO['Resource']),
               ("?s", surf.ns.DCTERMS['subject'], "?key"),
               (res.subject, member, "?key")
               ]
      where = [union(group(*where1),group(*where2))]
    elif surf.ns.GEMET['Theme'] in res.rdf_type:
      where.append(("?s", surf.ns.DCTERMS['subject'], "?key"))
      where.append((res.subject, member, "?key"))
    elif surf.namespace.SKOS['Concept'] in res.rdf_type:
      where.append(("?s", surf.ns.DCTERMS['subject'], res.subject)) 
    elif gemet_sg in res.rdf_type:
      where.append(("?s", surf.ns.DCTERMS['subject'], "?key"))
      where.append(("?group", member, "?key"))
      where.append((res.subject, member, "?group"))
    elif gemet_g in res.rdf_type:
      where.append(("?s", surf.ns.DCTERMS['subject'], "?key"))
      where.append((res.subject, member, "?key"))
                 
    query = surf.query.select("?s").where(*where).distinct()
  
    a =res.rdf_type
    # a.aa

    result = self.session.default_store.execute_sparql(sanitize_sparql("%s" % query))
    return result['results']['bindings']

  # def get_where_relations(self, resUri):
  #   direct_query = surf.query.select("?t ?o").where((resUri, "?t", "?o"))
  #   direct = self.session.default_store.execute_sparql("%s" % direct_query)
  #   inverse_query = surf.query.select("?t ?o").where(("?s", "?t", resUri))
  #   inverse = self.session.default_store.execute_sparql("%s" % inverse_query)


  #   if len(resources)>0:
  #         tree.append({
  #             'text': "%s (%s)" % (label, len(resources)),
  #             'id': "%s|%s" % (node, res.subject),
  #             "cls": "folder",
  #             "leaf": surf.namespace.SKOS['Concept'] in res.rdf_type
  #             })

  #   return result['results']['bindings']
    


def test():
  session = surf.Session(store)
  Collections = session.get_class(surf.ns.SKOS['Collection'])
  rootNode='http://www.eionet.europa.eu/gemet/theme/20'
  rootResource = session.get_resource(rootNode, Collections)

  session.get_class(surf.ns.RDF['resource']).get_by(rdfs_subPropertyOf = surf.ns.DCTERMS['relation'])

  res = CignoResources('http://cigno.ve.ismar.cnr.it/data/geonode:parchi_nazionali_regionali')
  # result = session.default_store.execute_sparql("SELECT ?o WHERE { <%s> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?o }" % )

  query = surf.query.select("?s").where(("?s", surf.ns.RDF['type'], surf.ns.CIGNO['Resource']),
                                        ("?s", surf.ns.DCTERMS['subject'], "?key"),
                                        ("?theme", member, "?key"),
                                        # ("?theme", surf.ns.SKOS['type'], surf.ns.CIGNO['Theme']),
                                        (rdflib.term.URIRef('http://www.corila.it/cigno/researchareas/1'), member, "?theme")
                                        ).distinct()

  query = surf.query.select("?theme").where((rdflib.term.URIRef('http://www.corila.it/cigno/researchareas/1'), member, "?theme"))
  query = surf.query.select("?s").where(("?s", surf.ns.DCTERMS['subject'], "?key"))

  where = (('?s', rdflib.term.URIRef('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), rdflib.term.URIRef('http://www.corila.it/cigno/cigno-schema.rdf#Resource')),
           ('?s', rdflib.term.URIRef('http://purl.org/dc/terms/subject'), '?key'), 
           ('?theme', rdflib.term.URIRef('http://www.w3.org/2004/02/skos/core#member'), '?key'), 
           (rdflib.term.URIRef('http://www.corila.it/cigno/researchareas/4'), rdflib.term.URIRef('http://www.w3.org/2004/02/skos/core#member'), '?theme'))


  query = "SELECT ?s WHERE { ?s <http://www.w3.org/2004/02/skos/core#member> <http://www.eionet.europa.eu/gemet/concept/1084>}"


  
  
  result = session.default_store.execute_sparql("%s" % query)
                                           
def graph_connections(request):
    crdf = CignoRDF()
    #s = 'http://cigno.ve.ismar.cnr.it/data/geonode:parchi_nazionali_regionali'
    s = request.POST['s']
    if not surf.util.is_uri(s):
      s = surf.ns.LOCAL[s]

    res = crdf.CignoResources(s)

    nodes = {"%s" % res.subject: {'id': "%s" % res.subject,
                                  'name': "%s" % res.rdfs_label.first,
                                  'data': { 'url': "%s" % res.subject,
                                            'uuid': "%s" % res.cigno_uuid.first
                                            },
                                  "adjacencies":[],
                                  'root': True
                                  }
             }
    
    for uritype in supported_relations:
      for node in getattr(res, surf.util.rdf2attr(uritype, True)):
        node = crdf.CignoResources(node) if  isinstance(node, URIRef) else node
        nodes["%s" % node] = {'id': "%s" % node.subject,
                              'name': "%s" % node.rdfs_label.first,
                              'data': { 'url': "%s" % node.subject,
                                        'uuid': "%s" % node.cigno_uuid.first
                                        },
                              "adjacencies":[]
                              }
        
        nodes["%s" % node]["adjacencies"].append({"nodeTo": "%s" % s,
                                                  "data": {}
                                                  }
                                                 )
        nodes["%s" % s]["adjacencies"].append({"nodeTo": "%s" % node.subject,
                                        "data": {}
                                        }
                                       )

      _subject = res
      if URIRef(uritype) in _subject.rdf_inverse:
        _predicate = crdf.Properties(reverse_relations[uritype])
        for node in _subject.rdf_inverse[URIRef(uritype)]:
          node = crdf.CignoResources(node) if  isinstance(node, URIRef) else node
          node.load()
          _object = node

          nodes["%s" % node] = {'id': "%s" % node.subject,
                                'name': "%s" % node.rdfs_label.first,
                                'data': { 'url': "%s" % node.subject,
                                          'uuid': "%s" % node.cigno_uuid.first
                                          },
                                "adjacencies":[]
                                }
        
          nodes["%s" % node]["adjacencies"].append({"nodeTo": "%s" % s,
                                                    "data": {}
                                                    }
                                                   )
          nodes["%s" % s]["adjacencies"].append({"nodeTo": "%s" % node.subject,
                                                 "data": {}
                                                 }
                                                )



            
    return HttpResponse(simplejson.dumps([v for k, v in nodes.iteritems()], indent = 4))
    #return render_to_response('graph_connections.html', RequestContext(request, {
    #            'nodes': json.dumps([v for k, v in nodes.iteritems()], indent = 4)
    #            }))



@csrf_exempt
def rdfapi(request, action="read"):
  # get base subject
  s = request.POST['s']
  if not surf.util.is_uri(s):
    s = surf.ns.LOCAL[s]

  crdf = CignoRDF()
  _subject = crdf.CignoResources(s)

  #s = 'http://cigno.ve.ismar.cnr.it/data/geonode:parchi_nazionali_regionali'
  #p = "http://purl.org/dc/terms/hasPart"
  #o = 'http://cigno.ve.ismar.cnr.it/data/'
  #pl = 'has part'
  #ol = 'esempio'

  if action != 'read' and not request.user.is_authenticated():
    json = {
      "success": False,
      "errors": "You are not allowed to change relations for this resource."
      }
    json_str = simplejson.dumps ( json, sort_keys=True, indent=4 )
    mimetype = "application/json"
    mimetype = "text/plain" # debug to see it indented in browser                                                                                                                          
    return HttpResponse("User not authorized to delete map", mimetype=mimetype, status=403)
    return response


  if action == 'read':
    # TODO inspect resource type
    json = {'rows': [], 'count': 0}

    # append converage
    # uritype = 'http://purl.org/dc/terms/spatial'
    #     for node in getattr(_subject, surf.util.rdf2attr(uritype, True)):
    #       _predicate = crdf.Properties(uritype)
    #       node = crdf.GeoNames(node) if  isinstance(node, URIRef) else node
    #       node.load()
    #       _object = node
    #       json['rows'].append({'id': '%s|%s|%s' % (s, _predicate.subject, _object.subject),
    #                            's': s, 
    #                            'p': _predicate.subject, 
    #                            'o': _object.subject,
    #                            'pl': lbyl(_predicate.rdfs_label),
    #                            'ol': lbyl(_object.gn_name),
    #                            'd': True
    #               })

    for uritype in supported_relations:
      for node in getattr(_subject, surf.util.rdf2attr(uritype, True)):
        _predicate = crdf.Properties(uritype)
        node = crdf.CignoResources(node) if  isinstance(node, URIRef) else node
        node.load()
        _object = node
        json['rows'].append({'id': '%s|%s|%s' % (s, _predicate.subject, _object.subject),
                             's': s, 
                             'p': _predicate.subject, 
                             'o': _object.subject,
                             'pl': lbyl(_predicate.rdfs_label),
                             'ol': lbyl(_object.rdfs_label),
                             'd': True
                             })

    for uritype in supported_relations:
      if URIRef(uritype) in _subject.rdf_inverse:
        _predicate = crdf.Properties(reverse_relations[uritype])
        for node in _subject.rdf_inverse[URIRef(uritype)]:
          node = crdf.CignoResources(node) if  isinstance(node, URIRef) else node
          node.load()
          _object = node
          json['rows'].append({'id': '%s|%s|%s' % (s, _predicate.subject, _object.subject),
                             's': s, 
                             'p': _predicate.subject, 
                             'o': _object.subject,
                             'pl': lbyl(_predicate.rdfs_label),
                             'ol': lbyl(_object.rdfs_label),
                             'd': False
                             })
    
  elif action == 'create':
    rows = simplejson.loads(request.POST['rows'])
    if not isinstance(rows, list): rows = [rows]
    for row in rows:
      crdf.store.add_triple(rdflib.URIRef(s), rdflib.URIRef(row['p']), rdflib.URIRef(row['o']))
      # if row['p'] in reverse_relations:
      #  store.add_triple(rdflib.URIRef(row['o']), rdflib.URIRef(reverse_relations[row['p']]), rdflib.URIRef(s))
    crdf.store.save()
    # if external try to load rdf info
    # TODO: use a better test and test if already loaded
    if not row['o'].startswith(surf.ns.LOCAL):
      crdf.store.load_triples(source = row['o'])

    json = {'success': True}
    # get type
    #result = session.default_store.execute_sparql("SELECT ?o WHERE { <%s> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?o }" % )
    #if len(result['results']['bindings']) >0:
    #  type_uri = result['results']['bindings'][0]['o']['value']

  elif action == 'destroy':
    rows = simplejson.loads(request.POST['rows'])
    if not isinstance(rows, list): rows = [rows]
    for row in rows:
      # get triple by id 
      s, p, o = row['id'].split('|')      
      crdf.store.remove_triple(rdflib.URIRef(s), rdflib.URIRef(p), rdflib.URIRef(o))
      # if p in reverse_relations:
      #  store.remove_triple(rdflib.URIRef(o), rdflib.URIRef(reverse_relations[p]), rdflib.URIRef(s))
      
    crdf.store.save()
    json = {'success': True}
    # get type
    #result = session.default_store.execute_sparql("SELECT ?o WHERE { <%s> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?o }" % )
    #if len(result['results']['bindings']) >0:
    #  type_uri = result['results']['bindings'][0]['o']['value']

  json_str = simplejson.dumps ( json, sort_keys=True, indent=4 )
  mimetype = "application/json"
  mimetype = "text/plain" # debug to see it indented in browser                                                                                                                          
  response = HttpResponse( json_str, mimetype=mimetype )
  return response


@csrf_exempt
def rdfrelations(request):
  crdf = CignoRDF()
  json = {'rows': []}
  for uri in supported_relations:
    r = crdf.Properties(uri)
    json['rows'].append({'uri': "%s" % r.subject,
                         'label': "%s" % r.rdfs_label.first
                         }
                        )
  
  json_str = simplejson.dumps ( json, sort_keys=True, indent=4 )
  mimetype = "application/json"
  mimetype = "text/plain" # debug to see it indented in browser                                                                                                                          
  response = HttpResponse( json_str, mimetype=mimetype )
  return response


@csrf_exempt
def research_areas(request, format):
    crdf = CignoRDF()
    node = request.REQUEST.get('node', 'http://www.corila.it/cigno/researchareas/')
    rootNode = node.split('|')[-1]
    rootResource = crdf.Collections(rootNode)
    tree = []
    results = crdf.get_not_empty_members(rootResource)
    for result in  results:
        member = result['c']['value']
        res = crdf.Collections(member)
        label = None
        try:  
          label = res.rdfs_label.first
        except AttributeError:
          pass
        if not label:
          try:
            label = res.skos_prefLabel.first
          except AttributeError:
            pass
        if not label:
          label = '%s' % res.subject

        resources = crdf.get_resources_by_classification(res)
        if len(resources)>0:
          tree.append({
              'text': "%s (%s)" % (label, len(resources)),
              'id': "%s|%s" % (node, res.subject),
              "cls": "folder",
              "leaf": surf.namespace.SKOS['Concept'] in res.rdf_type
              })

    json_str = simplejson.dumps ( tree, sort_keys=True, indent=4 )
    mimetype = "application/json"
    mimetype = "text/plain" # debug to see it indented in browser                                                                                                                          
    response = HttpResponse( json_str, mimetype=mimetype )
    return response

def _classification_search(query, start, limit, **kw):
    crdf = CignoRDF()
    rootNode = kw.get('node','').split('|')[-1]
    rootResource = crdf.Collections(rootNode)
    where = crdf.get_where_tree(rootResource)
    query_obj = select("?s").where(*where).distinct()
    querys = sanitize_sparql("%s" % query_obj)
    resources = crdf.session.default_store.execute_sparql(querys)
    results = []
    for resource in resources['results']['bindings']:
      res = crdf.CignoResources(resource['s']['value'])
      result = {}
      result['title'] = res.rdfs_label.first.format()
      result['uuid'] = res.cigno_uuid.first.format()
      result['detail'] = res.subject.format()
      results.append(result)

    result = {'rows': results, 
              'total': len(results)}

    result['query_info'] = {
        'start': start,
        'limit': limit,
        'q': query
    }
    if start > 0: 
        prev = max(start - limit, 0)
        params = urlencode({'q': query, 'start': prev, 'limit': limit})
        result['prev'] = reverse('geonode.maps.views.metadata_search') + '?' + params

    next = 3
    if next > 0:
        params = urlencode({'q': query, 'start': next - 1, 'limit': limit})
        result['next'] = reverse('geonode.maps.views.metadata_search') + '?' + params
    
    return result


from modeltranslation.settings import DEFAULT_LANGUAGE, AVAILABLE_LANGUAGES
from modeltranslation.utils import build_localized_fieldname, get_language
# list of rdflib.termLiteral
# literl by language
def lbyl(terms, lang_priority = None):
    terms_dict = {}
    if not lang_priority:
        lang_priority = [get_language(), DEFAULT_LANGUAGE]
    for i in terms:
        terms_dict[i.language] = i
    for lang in lang_priority:
        value = terms_dict.get(lang)
        if value is not None:
            return value
    return terms.first
        

    
    
    

from django.conf import settings
from rdflib.graph import Graph, ConjunctiveGraph
import rdflib
import surf
import os
def get_rdflib_store(db_conn, load_triples=True):
    createdb = False
    rdfstore = rdflib.plugin.get('Sleepycat', rdflib.store.Store)()
    # rdflib can create necessary structures if the store is empty
    rt = rdfstore.open(db_conn, create=False)
    if rt == rdflib.store.VALID_STORE:
        pass
    elif rt == rdflib.store.NO_STORE:
        rdfstore.open(db_conn, create=True)
        createdb = True
    elif rt == rdflib.store.CORRUPTED_STORE:
        rdfstore.destroy(db_conn)
        rdfstore.open(db_conn, create=True)
        createdb = True
    surfstore = surf.Store(reader='rdflib',
                           writer='rdflib',
                           rdflib_store = rdfstore)
    if createdb and load_triples:      
      sources = [
        #'file:/var/www/geonode/src/GeoNodePy/geonode/corila-researchareas.rdf',
        os.path.join(settings.PROJECT_ROOT,"stores","corila-researchareas.rdf"),
        'http://www.eionet.europa.eu/gemet/gemet-backbone.rdf',
        'http://www.eionet.europa.eu/gemet/gemet-skoscore.rdf',
        'http://www.eionet.europa.eu/gemet/gemet-groups.rdf?langcode=en',
        'http://www.eionet.europa.eu/gemet/gemet-groups.rdf?langcode=it',
        'http://www.eionet.europa.eu/gemet/gemet-definitions.rdf?langcode=en',
        'http://www.eionet.europa.eu/gemet/gemet-definitions.rdf?langcode=it',
        'http://dublincore.org/2010/10/11/dcterms.rdf',
        'http://www.geonames.org/ontology/ontology_v3.01.rdf'
        ]
      for source in sources:
        if not surfstore.load_triples(source = source):
          raise Exception('Cannot load %s' % source)
    return surfstore

def serialize_store(db_conn, filename):
    createdb = False
    rdfstore = rdflib.plugin.get('Sleepycat', rdflib.store.Store)()
    # rdflib can create necessary structures if the store is empty
    rt = rdfstore.open(db_conn, create=False)
    cg = ConjunctiveGraph(store=rdfstore)
    f = open(filename, 'w')
    cg.serialize(f)
    f.close()
    return True

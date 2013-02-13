# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding field 'CodeLicense.label_it'
        db.add_column('metadata_codelicense', 'label_it', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True), keep_default=False)

        # Adding field 'CodeLicense.label_en'
        db.add_column('metadata_codelicense', 'label_en', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True), keep_default=False)

        # Adding field 'CodeLicense.abstract_it'
        db.add_column('metadata_codelicense', 'abstract_it', self.gf('django.db.models.fields.CharField')(max_length=500, null=True, blank=True), keep_default=False)

        # Adding field 'CodeLicense.abstract_en'
        db.add_column('metadata_codelicense', 'abstract_en', self.gf('django.db.models.fields.CharField')(max_length=500, null=True, blank=True), keep_default=False)


    def backwards(self, orm):
        
        # Deleting field 'CodeLicense.label_it'
        db.delete_column('metadata_codelicense', 'label_it')

        # Deleting field 'CodeLicense.label_en'
        db.delete_column('metadata_codelicense', 'label_en')

        # Deleting field 'CodeLicense.abstract_it'
        db.delete_column('metadata_codelicense', 'abstract_it')

        # Deleting field 'CodeLicense.abstract_en'
        db.delete_column('metadata_codelicense', 'abstract_en')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2012, 11, 4, 4, 55, 19, 474986)'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2012, 11, 4, 4, 55, 19, 474845)'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'maps.contact': {
            'Meta': {'object_name': 'Contact'},
            'area': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'city': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'country': ('django.db.models.fields.CharField', [], {'max_length': '3', 'null': 'True', 'blank': 'True'}),
            'delivery': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'fax': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'organization': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'position': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'voice': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'zipcode': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'maps.contactrole': {
            'Meta': {'unique_together': "(('contact', 'layer', 'role'),)", 'object_name': 'ContactRole'},
            'contact': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['maps.Contact']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'layer': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['maps.Layer']"}),
            'role': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['maps.Role']"})
        },
        'maps.layer': {
            'Meta': {'object_name': 'Layer'},
            'abstract': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'constraints_other': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'constraints_use': ('django.db.models.fields.CharField', [], {'default': "'copyright'", 'max_length': '255'}),
            'contacts': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['maps.Contact']", 'through': "orm['maps.ContactRole']", 'symmetrical': 'False'}),
            'data_quality_statement': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'date': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'date_type': ('django.db.models.fields.CharField', [], {'default': "'publication'", 'max_length': '255'}),
            'distribution_description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'distribution_url': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'edition': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'geographic_bounding_box': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'keywords_region': ('django.db.models.fields.CharField', [], {'default': "'USA'", 'max_length': '3'}),
            'language': ('django.db.models.fields.CharField', [], {'default': "'eng'", 'max_length': '3'}),
            'maintenance_frequency': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'purpose': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'spatial_representation_type': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'store': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'storeType': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'supplemental_information': ('django.db.models.fields.TextField', [], {'default': "u'You can customize the template to suit your needs. You can add and remove fields and fill out default information (e.g. contact details). Fields you can not change in the default view may be accessible in the more comprehensive (and more complex) advanced view. You can even use the XML editor to create custom structures, but they have to be validated by the system, so know what you do :-)'"}),
            'temporal_extent_end': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'temporal_extent_start': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'topic_category': ('django.db.models.fields.CharField', [], {'default': "'location'", 'max_length': '255'}),
            'typename': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '128'}),
            'uuid': ('django.db.models.fields.CharField', [], {'max_length': '36'}),
            'workspace': ('django.db.models.fields.CharField', [], {'max_length': '128'})
        },
        'maps.role': {
            'Meta': {'object_name': 'Role'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'value': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'})
        },
        'mdtools.connection': {
            'Meta': {'object_name': 'Connection'},
            'connection_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['mdtools.ConnectionType']"}),
            'd_content_type': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'connector_d'", 'to': "orm['contenttypes.ContentType']"}),
            'd_object_id': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'o_content_type': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'connector_o'", 'to': "orm['contenttypes.ContentType']"}),
            'o_object_id': ('django.db.models.fields.PositiveIntegerField', [], {})
        },
        'mdtools.connectiontype': {
            'Meta': {'object_name': 'ConnectionType'},
            'code': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'inverse': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['mdtools.ConnectionType']", 'null': 'True', 'blank': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.codecharacterset': {
            'Meta': {'object_name': 'CodeCharacterSet'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'isoid': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.codeclassification': {
            'Meta': {'object_name': 'CodeClassification'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'isoid': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.codedatetype': {
            'Meta': {'object_name': 'CodeDateType'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'isoid': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.codedistributionformat': {
            'Meta': {'ordering': "['ordering']", 'object_name': 'CodeDistributionFormat'},
            'format': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'mimetype': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'ordering': ('django.db.models.fields.IntegerField', [], {}),
            'version': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.codelicense': {
            'Meta': {'object_name': 'CodeLicense'},
            'abstract': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'abstract_en': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            'abstract_it': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        'metadata.codemaintenancefrequency': {
            'Meta': {'object_name': 'CodeMaintenanceFrequency'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'isoid': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.codepresentationform': {
            'Meta': {'object_name': 'CodePresentationForm'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'isoid': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.coderefsys': {
            'Meta': {'object_name': 'CodeRefSys'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'srid': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'})
        },
        'metadata.coderestriction': {
            'Meta': {'object_name': 'CodeRestriction'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'isoid': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.coderole': {
            'Meta': {'object_name': 'CodeRole'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'isoid': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.codesamplefrequency': {
            'Meta': {'object_name': 'CodeSampleFrequency'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'isoid': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.codescope': {
            'Meta': {'object_name': 'CodeScope'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'isoid': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.codespatialrepresentationtype': {
            'Meta': {'object_name': 'CodeSpatialRepresentationType'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'isoid': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.codetitle': {
            'Meta': {'object_name': 'CodeTitle'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.codetopiccategory': {
            'Meta': {'object_name': 'CodeTopicCategory'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'isoid': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.codeverticaldatum': {
            'Meta': {'object_name': 'CodeVerticalDatum'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.conformity': {
            'Meta': {'object_name': 'Conformity'},
            'date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'date_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeDateType']"}),
            'degree': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.LayerExt']"}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'metadata.connection': {
            'Meta': {'object_name': 'Connection'},
            'connection_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.ConnectionType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'o_url': ('django.db.models.fields.URLField', [], {'max_length': '500'}),
            's_url': ('django.db.models.fields.URLField', [], {'max_length': '500'})
        },
        'metadata.connectiontype': {
            'Meta': {'object_name': 'ConnectionType'},
            'code': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'inverse': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.ConnectionType']", 'null': 'True', 'blank': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '500'})
        },
        'metadata.dccoderesourcetype': {
            'Meta': {'object_name': 'DcCodeResourceType'},
            'dcid': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'label_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'label_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'metadata.layerext': {
            'Meta': {'object_name': 'LayerExt', '_ormbases': ['maps.Layer']},
            'abstractml': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'abstractml_en': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'abstractml_it': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'access_constraints': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'metadata_layerext_access_constraints'", 'null': 'True', 'to': "orm['metadata.CodeRestriction']"}),
            'character_set': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'metadata_layerext_character_set'", 'null': 'True', 'to': "orm['metadata.CodeCharacterSet']"}),
            'distance': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'distribution_format': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['metadata.CodeDistributionFormat']", 'null': 'True', 'blank': 'True'}),
            'equivalent_scale': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'gemetkeywords': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'geonamesids': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'inspire': ('django.db.models.fields.NullBooleanField', [], {'default': 'True', 'null': 'True', 'blank': 'True'}),
            'layer_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['maps.Layer']", 'unique': 'True', 'primary_key': 'True'}),
            'license': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'metadata_layerext_license'", 'null': 'True', 'to': "orm['metadata.CodeLicense']"}),
            'lineage': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'lineage_en': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'lineage_it': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'md_character_set': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'metadata_layerext_md_character_set'", 'null': 'True', 'to': "orm['metadata.CodeCharacterSet']"}),
            'md_date_stamp': ('django.db.models.fields.DateField', [], {'default': 'datetime.datetime.now'}),
            'md_responsible_party_role': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'layerext_md_responsible_party_role'", 'to': "orm['metadata.ResponsibleParty']", 'through': "orm['metadata.MdResponsiblePartyRole']", 'blank': 'True', 'symmetrical': 'False', 'null': 'True'}),
            'md_standard_name': ('django.db.models.fields.CharField', [], {'default': "'ISO19115'", 'max_length': '100'}),
            'md_uuid': ('django.db.models.fields.CharField', [], {'default': "'fb34bf68-880f-48ae-a9a8-c0fa4b7e3284'", 'max_length': '36'}),
            'md_version_name': ('django.db.models.fields.CharField', [], {'default': "'2003'", 'max_length': '100'}),
            'other_citation_details': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'other_citation_details_en': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'other_citation_details_it': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'other_constraints': ('django.db.models.fields.TextField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'other_constraints_en': ('django.db.models.fields.TextField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'other_constraints_it': ('django.db.models.fields.TextField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'presentation_form': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['metadata.CodePresentationForm']", 'null': 'True', 'blank': 'True'}),
            'ref_sys': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'metadata_layerext_ref_sys'", 'null': 'True', 'to': "orm['metadata.CodeRefSys']"}),
            'resource_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeScope']", 'null': 'True', 'blank': 'True'}),
            'responsible_party_role': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'layerext_responsible_party_role'", 'to': "orm['metadata.ResponsibleParty']", 'through': "orm['metadata.ResponsiblePartyRole']", 'blank': 'True', 'symmetrical': 'False', 'null': 'True'}),
            'security_constraints': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeClassification']", 'null': 'True', 'blank': 'True'}),
            'spatial_representation_type_ext': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['metadata.CodeSpatialRepresentationType']", 'null': 'True', 'blank': 'True'}),
            'supplemental_information_ml': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'supplemental_information_ml_en': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'supplemental_information_ml_it': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'titleml': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'titleml_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'titleml_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'topic_category_ext': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['metadata.CodeTopicCategory']", 'null': 'True', 'blank': 'True'}),
            'uom_distance': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'uom_vertical_extent': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'update_frequency': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeMaintenanceFrequency']", 'null': 'True', 'blank': 'True'}),
            'use_constraints': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'metadata_layerext_user_constraints'", 'null': 'True', 'to': "orm['metadata.CodeRestriction']"}),
            'use_limitation': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'use_limitation_en': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'use_limitation_it': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'vertical_datum': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'metadata_layerext_vertical_datum'", 'null': 'True', 'to': "orm['metadata.CodeVerticalDatum']"}),
            'vertical_extent_max': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'vertical_extent_min': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'})
        },
        'metadata.mdresponsiblepartyrole': {
            'Meta': {'object_name': 'MdResponsiblePartyRole'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.LayerExt']"}),
            'responsible_party': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.ResponsibleParty']"}),
            'role': ('django.db.models.fields.related.ForeignKey', [], {'default': '7', 'to': "orm['metadata.CodeRole']"})
        },
        'metadata.onlineresource': {
            'Meta': {'object_name': 'OnlineResource'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.LayerExt']"}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '400'})
        },
        'metadata.referencedate': {
            'Meta': {'object_name': 'ReferenceDate'},
            'date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'date_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeDateType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.LayerExt']"})
        },
        'metadata.resource': {
            'Meta': {'object_name': 'Resource'},
            'abstractml': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'abstractml_en': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'abstractml_it': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'access_constraints': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'metadata_resource_access_constraints'", 'null': 'True', 'to': "orm['metadata.CodeRestriction']"}),
            'base_file': ('django.db.models.fields.files.FileField', [], {'max_length': '1024', 'null': 'True', 'blank': 'True'}),
            'character_set': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'metadata_resource_character_set'", 'null': 'True', 'to': "orm['metadata.CodeCharacterSet']"}),
            'distance': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'distribution_format': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['metadata.CodeDistributionFormat']", 'null': 'True', 'blank': 'True'}),
            'equivalent_scale': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'gemetkeywords': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'geographic_bounding_box': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'geonamesids': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'inspire': ('django.db.models.fields.NullBooleanField', [], {'default': 'True', 'null': 'True', 'blank': 'True'}),
            'language': ('django.db.models.fields.CharField', [], {'default': "'ita'", 'max_length': '3', 'blank': 'True'}),
            'license': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'metadata_resource_license'", 'null': 'True', 'to': "orm['metadata.CodeLicense']"}),
            'lineage': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'lineage_en': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'lineage_it': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'md_character_set': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'metadata_resource_md_character_set'", 'null': 'True', 'to': "orm['metadata.CodeCharacterSet']"}),
            'md_creation': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'md_date_stamp': ('django.db.models.fields.DateField', [], {'default': 'datetime.datetime.now'}),
            'md_last_modify': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'md_responsible_party_role': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'md_responsible_party_role'", 'to': "orm['metadata.ResponsibleParty']", 'through': "orm['metadata.ResourceMdResponsiblePartyRole']", 'blank': 'True', 'symmetrical': 'False', 'null': 'True'}),
            'md_standard_name': ('django.db.models.fields.CharField', [], {'default': "'ISO19115'", 'max_length': '100'}),
            'md_uuid': ('django.db.models.fields.CharField', [], {'default': "'e3defb6d-0caf-408b-b209-298c3f4d9612'", 'max_length': '36'}),
            'md_version_name': ('django.db.models.fields.CharField', [], {'default': "'2003'", 'max_length': '100'}),
            'mimetype': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'other_citation_details': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'other_citation_details_en': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'other_citation_details_it': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'other_constraints': ('django.db.models.fields.TextField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'other_constraints_en': ('django.db.models.fields.TextField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'other_constraints_it': ('django.db.models.fields.TextField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'presentation_form': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['metadata.CodePresentationForm']", 'null': 'True', 'blank': 'True'}),
            'ref_sys': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'metadata_resource_ref_sys'", 'null': 'True', 'to': "orm['metadata.CodeRefSys']"}),
            'resource_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeScope']", 'null': 'True', 'blank': 'True'}),
            'responsible_party_role': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'responsible_party_role'", 'to': "orm['metadata.ResponsibleParty']", 'through': "orm['metadata.ResourceResponsiblePartyRole']", 'blank': 'True', 'symmetrical': 'False', 'null': 'True'}),
            'security_constraints': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeClassification']", 'null': 'True', 'blank': 'True'}),
            'spatial_representation_type_ext': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['metadata.CodeSpatialRepresentationType']", 'null': 'True', 'blank': 'True'}),
            'supplemental_information_ml': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'supplemental_information_ml_en': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'supplemental_information_ml_it': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'titleml': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'titleml_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'titleml_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'topic_category': ('django.db.models.fields.CharField', [], {'default': "'location'", 'max_length': '255'}),
            'topic_category_ext': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['metadata.CodeTopicCategory']", 'null': 'True', 'blank': 'True'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'uom_distance': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'uom_vertical_extent': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'update_frequency': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeMaintenanceFrequency']", 'null': 'True', 'blank': 'True'}),
            'url_field': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'use_constraints': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'metadata_resource_user_constraints'", 'null': 'True', 'to': "orm['metadata.CodeRestriction']"}),
            'use_limitation': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'use_limitation_en': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'use_limitation_it': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'uuid': ('django.db.models.fields.CharField', [], {'default': "'b0561c4d-37b3-4dd3-9d74-52d9585e238c'", 'max_length': '36'}),
            'vertical_datum': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'metadata_resource_vertical_datum'", 'null': 'True', 'to': "orm['metadata.CodeVerticalDatum']"}),
            'vertical_extent_max': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'vertical_extent_min': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'})
        },
        'metadata.resourceconformity': {
            'Meta': {'object_name': 'ResourceConformity'},
            'date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'date_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeDateType']"}),
            'degree': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'conformity_set'", 'to': "orm['metadata.Resource']"}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'metadata.resourcemdresponsiblepartyrole': {
            'Meta': {'object_name': 'ResourceMdResponsiblePartyRole'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'mdresponsiblepartyrole_set'", 'to': "orm['metadata.Resource']"}),
            'responsible_party': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.ResponsibleParty']"}),
            'role': ('django.db.models.fields.related.ForeignKey', [], {'default': '7', 'to': "orm['metadata.CodeRole']"})
        },
        'metadata.resourcereferencedate': {
            'Meta': {'object_name': 'ResourceReferenceDate'},
            'date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'date_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeDateType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'referencedate_set'", 'to': "orm['metadata.Resource']"})
        },
        'metadata.resourceresponsiblepartyrole': {
            'Meta': {'object_name': 'ResourceResponsiblePartyRole'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'responsiblepartyrole_set'", 'to': "orm['metadata.Resource']"}),
            'responsible_party': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.ResponsibleParty']"}),
            'role': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeRole']"})
        },
        'metadata.resourcetemporalextent': {
            'Meta': {'object_name': 'ResourceTemporalExtent'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'temporalextent_set'", 'to': "orm['metadata.Resource']"}),
            'sample_frequency_uom': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeSampleFrequency']", 'null': 'True', 'blank': 'True'}),
            'sample_frequency_value': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'temporal_extent_begin': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'temporal_extent_end': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'})
        },
        'metadata.responsibleparty': {
            'Meta': {'ordering': "['organization_name', 'surname', 'name']", 'object_name': 'ResponsibleParty'},
            'email': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'office': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'office_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'office_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'organization_address': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'organization_email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'organization_name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'organization_name_en': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'organization_name_it': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'organization_tel': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'organization_web': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'surname': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'tel': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeTitle']", 'null': 'True', 'blank': 'True'})
        },
        'metadata.responsiblepartyrole': {
            'Meta': {'object_name': 'ResponsiblePartyRole'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.LayerExt']"}),
            'responsible_party': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.ResponsibleParty']"}),
            'role': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeRole']"})
        },
        'metadata.temporalextent': {
            'Meta': {'object_name': 'TemporalExtent'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metadata': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.LayerExt']"}),
            'sample_frequency_uom': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['metadata.CodeSampleFrequency']", 'null': 'True', 'blank': 'True'}),
            'sample_frequency_value': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'temporal_extent_begin': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'temporal_extent_end': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'})
        },
        'taggit.tag': {
            'Meta': {'object_name': 'Tag'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '100', 'db_index': 'True'})
        },
        'taggit.taggeditem': {
            'Meta': {'object_name': 'TaggedItem'},
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'taggit_taggeditem_tagged_items'", 'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'object_id': ('django.db.models.fields.IntegerField', [], {'db_index': 'True'}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'taggit_taggeditem_items'", 'to': "orm['taggit.Tag']"})
        }
    }

    complete_apps = ['metadata']

from setuptools import setup, find_packages
import pkg_resources
import sys, os

name='CIGNo'
version = "1.1"
req = pkg_resources.Requirement.parse(name)

setup(name=name,
      version=version,
      description="Share scientific data",
      long_description=open('README.rst').read(),
      classifiers=[
        "Development Status :: 1 - Planning" ], 
      keywords='',
      author='CIGNo Developers',
      author_email='dev@geonode.org',
      url='http://cigno.ve.ismar.cnr.it',
      license='GPL',
      packages = find_packages(),
      include_package_data=True,
      install_requires = [
          "django-rosetta",
      ],
      zip_safe=False,
      entry_points="""
      # -*- Entry points: -*-
      """,
      )



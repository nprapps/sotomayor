#!/usr/bin/env python

from cssmin import cssmin
from flask import Markup, g
from slimit import minify

import app_config

class Includer(object):
    """
    Base class for Javascript and CSS psuedo-template-tags.
    """
    def __init__(self):
        self.includes = []
        self.tag_string = None

    def push(self, path):
            self.includes.append(path)

            return ""

    def _compress(self):
        raise NotImplementedError()

    def render(self, path):
        if getattr(g, 'compile_includes', False):
            out_filename = 'www/%s' % path
            
            if out_filename not in g.compiled_includes:
                print 'Rendering %s' % out_filename

                with open(out_filename, 'w') as f:
                    f.write(self._compress())

            # See "fab render"
            g.compiled_includes.append(out_filename)

            markup = Markup(self.tag_string % path)
        else:
            response = ','.join(self.includes)
            
            response = '\n'.join([
                self.tag_string % src for src in self.includes
                ])

            markup = Markup(response)

        del self.includes[:]

        return markup 

class JavascriptIncluder(Includer):
    """
    Psuedo-template tag that handles collecting Javascript and serving appropriate clean or compressed versions.
    """
    def __init__(self):
        Includer.__init__(self)

        self.tag_string = '<script type="text/javascript" src="%s"></script>'

    def _compress(self):
        output = []

        for src in self.includes:
            with open('www/%s' % src) as f:
                print '- minifying %s' % src
                output.append(minify(f.read()))

        return '\n'.join(output)

class CSSIncluder(Includer):
    """
    Psuedo-template tag that handles collecting CSS and serving appropriate clean or compressed versions.
    """
    def __init__(self):
        Includer.__init__(self)

        self.tag_string = '<link rel="stylesheet" type="text/css" href="%s" />'

    def _compress(self):
        output = []

        for src in self.includes:
            if src.endswith('less'):
                src = src.replace('less', 'css')

            with open('www/%s' % src) as f:
                print '- minifying %s' % src
                output.append(cssmin(f.read()))

        return '\n'.join(output)

def make_context():
    context = app_config.__dict__

    context['JS'] = JavascriptIncluder()
    context['CSS'] = CSSIncluder()

    return context


/*
# template-views.js
Copyright (c) 2016 kruemelo https://github.com/kruemelo
license: MIT (http://opensource.org/licenses/mit-license.php)
*/
(function (definition) {

  if (!('import' in document.createElement('link'))) {
    console.warn('link.import is not supported by this browser. add webcomponents polyfill from https://github.com/webcomponents/webcomponentsjs');
  }
    
  if (typeof module !== 'undefined') {
    // CommonJS
    module.exports = definition(require('underscore'), require('Backbone'));
  }
  else if (typeof define === 'function' && typeof define.amd === 'object') {
    // AMD
    define(['underscore', 'Backbone'], definition);
  }
  else if (typeof window === 'object') {
    window.BackboneComponents = definition(_, Backbone);
  }

}(function (_, Backbone) {

  'use strict';

  function BackboneComponents () {

  }


  BackboneComponents.BaseView = Backbone.View.extend({

    initialize: function (/*options*/) {
      // Backbone.View.prototype.initialize.apply(this, arguments);
    },

    close: function () {
      this.remove();
      return this;
    }
  });


  BackboneComponents.extend = function (baseComponent, component) {
    
    if (!component) {
      component = baseComponent;
      baseComponent = BackboneComponents.BaseView;
    }

    var extended = baseComponent.extend(component);

    extended.prototype.super = baseComponent;

    return extended;
  };


  BackboneComponents.registeredComponents = {};

  BackboneComponents.pendingUrls = {};

  BackboneComponents.timeout = 30000;


  BackboneComponents.addLink = function (url) {

    return new Promise (function (resolve, reject) {

      var link = document.createElement('link');
      
      link.rel = 'import';
      link.href = url;
      link.setAttribute('async', true);

      link.onload = function () {
        resolve(this.import);
      };

      link.onerror = function (e) {
        reject(e);
      };

      window.document.head.appendChild(link);
    });
  };


  BackboneComponents.register = function (componentName, componentClass) {

    if (typeof componentClass !== 'function') {
      throw new Error('class "' + componentName + '" is not a function');
    }      
      
    BackboneComponents.registeredComponents[componentName] = {
      url: null,
      class: componentClass
    };

    window[componentName] = componentClass;    

    return componentClass;
  };


  BackboneComponents.waitForComponentRegistered = function (url, componentName, timeout) {

    return new Promise (function (resolve, reject) {

      // wait for class loaded completely
      var waitInterval,
        intervalLenght = 20,
        registered = false;

      // wait for component
      waitInterval = setInterval(function () {
        // find registered component by url
        var component = BackboneComponents.registeredComponents[componentName];
        if (component) {
            clearInterval(waitInterval);
            registered = true;
            component.url = url;
            resolve();
        }
      }, intervalLenght);        

      if (timeout) {
        setTimeout(function () {
          if (!registered) {
            clearInterval(waitInterval);
            reject(
              new Error('timeout on loading component "' + componentName +'" from "' + url + '"')
            );
          }
        }, timeout);
      }

    });
  };


  BackboneComponents.import = function (urls) {

    if (!Array.isArray(urls)) {
      urls = [urls];
    }


    function handleImport (url, imported) {

      return new Promise (function (resolve, reject) {

        var componentNode,
          componentName,
          templateScriptNodes,
          componentStyleNode,
          styleNode;

        componentNode = imported.querySelector('backbone-component');

        if (!componentNode) {
          return reject(new Error('no backbone-component defined in "' + url + '"'));
        }

        componentName = componentNode.getAttribute('name');

        if (!componentName) {
          return reject(new Error('no component name defined in "' + url + '"'));
        }

        BackboneComponents.pendingUrls[url] = componentName;

        templateScriptNodes = componentNode.querySelectorAll('script[type="text/html-template"]');

        componentStyleNode = componentNode.querySelector('style[type="text/css-template"]');
        
        BackboneComponents.waitForComponentRegistered(url, componentName, BackboneComponents.timeout)
          .then(function () {

            var component = BackboneComponents.registeredComponents[componentName];

            // add templates
            component.class.templates = {}; 

            _.each(templateScriptNodes, function (templateNode) {
              component.class.templates[templateNode.id] = _.template(templateNode.innerHTML);
            });

            if (componentStyleNode) {
              styleNode = document.createElement('style');
              styleNode.innerHTML = componentStyleNode.innerHTML;
              document.head.appendChild(styleNode);
            }

            resolve();

          })
          .catch(reject);
      });
    }


    return Promise.all(
      urls.map(function (url) {

        var component; 

        if (!url) {
          return Promise.resolve();
        }

        if (BackboneComponents.pendingUrls[url]) {
          // already on load, skip to handle circular deps
          return Promise.resolve();
        }

        // already registered?
        component = _.find(
          BackboneComponents.registeredComponents, 
          function (component) {
            return component.url === url;
          }
        );

        if (component) {
          return Promise.resolve();
        }
            
        // add to pending imports
        BackboneComponents.pendingUrls[url] = true;

        return BackboneComponents.addLink(url)
          .then(function (imported) {
            return handleImport(url, imported);
          });
      })
     );   
  };

  return BackboneComponents;

}));



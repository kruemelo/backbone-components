# backbone-components

use backbone views like webcomponents

## Example

index.html:

```js

BackboneComponents.import('test-view.html')
  .then(function () {

    var testView = new TestView({
      el: document.querySelector('#container')
    });

    testView.render();
    
  });

```

component file `test-view.html`:

```html
<backbone-component name="TestView">

  <!-- html templates -->

  <script type="text/html-template" id="main">
    <div class="test-view">
      <button class="btn-clickme">clickme</button>
      <h1>says <%-say %> </h1>      
    </div>
  </script>

  <script type="text/html-template" id="other">
      <h2>other content</h2>
  </script>

  <!-- backbone view definition -->
  <script type="text/javascript">

  (function () {

    // define backbone view
    var TestView =  BackboneComponents.extend({

      events: {
        'click .btn-clickme': function () {
          this.$('.test-view').append(TestView.templates.other());
        }
      },

      render: function () {
        this.$el.html(
          TestView.templates.main({say: 'hi!'})
        );
      }
    });

    // register view
    BackboneComponents.register('TestView', TestView);

  }());
  </script>

</backbone-component>

```

- supports nested components
- easily define multiple [html templates](http://underscorejs.org/#template) for a component 
- handles dependencies for you
- lets you define css styles 
- all in one file!

also see `example` folder for more examples.

when starting `example/index.html` with `file://` protocol in chrome, start chrome option `--allow-insecure-localhost` 

want to run from web server? 

```
$ npm run static-server
static-server listening on http://localhost:3000
```

goto [http://localhost:3000/example/](http://localhost:3000/example/) to see the example

requires: backbonejs, underscorejs and jquery

firefox requries web components polyfill to import 
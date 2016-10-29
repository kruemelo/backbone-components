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

	<!-- optional: html templates -->
	<script type="text/html-template" id="test">
 			<div class="test-view">
				<button class="btn-clickme">clickme</button>
				<h1>says <%-say %> </h1> 			
			</div>
	</script>


	<!-- mandatory: backbone view definition -->
	<script type="text/javascript">

	(function () {

		// define backbone view
		var TestView = 	BackboneComponents.extend({

		  events: {'click .btn-clickme': 'close'},

		  render: function () {

		    this.$el.html(
	    		TestView.templates.test({say: 'hi!'})
	    	);
		  }
		});

		// register view
		BackboneComponents.register('TestView', TestView);

	}());
	</script>

</backbone-component>

```

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
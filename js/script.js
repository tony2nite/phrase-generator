/* Author: Anthony Hughes

*/


(function ($) {
	var cache;
	var linkedInSearchURL;
	$.fn.center = function () {
	    var h = this.height();
	    var p = this.parent().height();
	    this.css('padding-top', ((p - h) * 0.5) + "px");
	    return this;
	}
    $.fn.showGoogleDocRow = function (options) {
        var defaultVal = {};
        var obj = $.extend(defaultVal, options);
        var feed = 'cells';
        var worksheet = 'od6';
        var url = 'http://spreadsheets.google.com/feeds/' + feed + '/' + options['key'] + '/' + worksheet + '/public/basic?alt=json-in-script&callback=?';
        
        var target = this;
        var random = function () {
			var result = [];
			var ids = [];
			for (c in cache) {
			  var index = Math.floor(Math.random() * cache[c].length);
		      var value = cache[c][index];
		      if (value != "-") {
				  ids.push(index);
				  result.push(cache[c][index])
		      }
			};
			return {'id': ids.join("-"), 'text' : result.join(" ")};
        }
        
        var byID = function (id) {
        	var ids = id.split("-");
        	var result = [];
        	var i = 0;
 			for (c in cache) {
       			result.push(cache[c][ids[i]]);
       			i++;
        	}
			return {'id': id, 'text' : result.join(" ")};
         }
        
        var writeTextToDOM = function() {
        	var result;
        	var id = options['id'];
        	if (id) {
        		console.log('looking up for id' + id)
        		result = byID(id);
        	} else {
        		console.log('generating random');
	        	result = random();
	        	app_router.navigate(result['id']);
        	}
        	target.fadeOut('slow', function () {
        		$(this).text(result['text']).fadeIn();
        		$(this).center();
        	});
			
			// set up next button
			r = random();
			$('#another').attr('href', '#' + r['id']);
			
			if (!linkedInSearchURL) {
				linkedInSearchURL = $('#linkedin').attr('href');
			}
			$('#linkedin').attr('href', linkedInSearchURL.split('%s').join(escape(result.text)))
        }
        
        if (cache) {
        	writeTextToDOM();
        } else {
	        $.getJSON(url, function (data) {
	        	var parsed = {};
	        	for(var i=0,j=data.feed.entry.length; i<j; i++){
				  var e = data.feed.entry[i];
				  var column = e['title']['$t'].match(/^\w/)[0];
				  if (!parsed[column]) {
				  	parsed[column] = [];
				  }
				  var value = e['content']['$t'];
				  if (value && value.length > 0)
				 	parsed[column].push(value);
				};
				cache = parsed;
				writeTextToDOM();
	        });
	     }
     }
})(jQuery);  

var app_router;
var gdKey = "0Ar82_f2iKtoCdGFZR3FmN0xyN3p4SG5YTF9jNWozQWc";

$(function() {
	
	var results = $('#results p');
	// setup routing
	var AppRouter = Backbone.Router.extend({
	  routes: {
	  	"" : "defaultRoute",
	    ":id": "jobTitleIDRoute"
	  },
	
	  defaultRoute: function () {
	  	console.log('default route');
		results.showGoogleDocRow({'key' : gdKey});
	  },
	  jobTitleIDRoute: function(id) {
	  	console.log('router found id' + id);
	 	results.showGoogleDocRow({'key' : gdKey, 'id' : id})
	  }
	
	});
	app_router = new AppRouter;
	Backbone.history.start();
	
	
	// facebook post
	$('a[href="#facebook-post"]').click(function (e) {
		var title = results.text();
		var id = document.location.hash.substring(1);
		console.log(title);
		FB.ui({ 
		 	method: 'feed',
	     	name: 'I am now a ' + title,
	     	link: 'http://promotiongenerator.sunandair.com/#' + id,
	        caption: 'Previously I felt under-valued, but thanks to DIPG, I have been promoted to ' + title + ' '
		});
		e.preventDefault();
		return false;
	});
});

// login & signup

$('#signupBtn').click(function () {
	 let data   = $('form').serialize();
	 let signup = $.ajax({
	 	type: 'POST',
	 	data: data,
	 	dataType: 'JSON',
	 	url: 'user/register.json',
	 	success: function(resultsData, status) {
	 		let results = JSON.parse(resultsData);
	 		if (results.success === 'true') {
	 			console.log('signup success');
	 			window.location.href = 'timeline.html';
	 		} else if (results.success === 'false') {
	 			console.log('signup failure');
	 		}
	 	}
	 }); 
});

$('#loginBtn').click(function () {
	 let data  = $('form').serialize();
	 let login = $.ajax({
	 	type: 'POST',
	 	data: data,
	 	dataType: 'JSON',
	 	url: 'user/login.json',
	 	success: function(resultsData, status) {
	 		let results = JSON.parse(resultsData);
	 		if (results.success === 'true') {
	 			console.log('login success');
	 			window.location.href = 'timeline.html';
	 		} else if (results.success === 'false') {
	 			console.log('login failure');
	 		}
	 	}
	 });
});

(function( $ ) {

	var $container = $('.masonry-container');
	$container.imagesLoaded( function () {
		$container.masonry({
			columnWidth: '.item',
			itemSelector: '.item'
		});
	});
	
	//Reinitialize masonry inside each panel after the relative tab link is clicked - 
	$('a[data-toggle=tab]').each(function () {
		var $this = $(this);

		$this.on('shown.bs.tab', function () {
		
			$container.imagesLoaded( function () {
				$container.masonry({
					columnWidth: '.item',
					itemSelector: '.item'
				});
			});

		}); //end shown
	});  //end each
	
})(jQuery);

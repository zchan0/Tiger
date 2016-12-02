'use strict';

// login & signup

$('#signupBtn').click(function () {
	var data = $('form').serialize();
	var signup = $.ajax({
		type: 'POST',
		data: data,
		dataType: 'JSON',
		url: 'user/register.json',
		success: function success(resultsData, status) {
			var results = JSON.parse(resultsData);
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
	var data = $('form').serialize();
	var login = $.ajax({
		type: 'POST',
		data: data,
		dataType: 'JSON',
		url: 'user/login.json',
		success: function success(resultsData, status) {
			var results = JSON.parse(resultsData);
			if (results.success === 'true') {
				console.log(results);
				window.location.href = 'timeline.html';
			} else if (results.success === 'false') {
				console.log('login failed');
				// show login error message
				$('#alertDiv').removeClass('hidden');
			}
		}
	});
});

$('#signupForm').validate();
$('#loginForm').validate();

// dismiss login error message
$('#alertDiv').click(function () {
	$(this).addClass('hidden');
});

(function ($) {

	var $container = $('.masonry-container');
	$container.imagesLoaded().progress(function () {
		$container.masonry({
			columnWidth: '.item',
			itemSelector: '.item'
		});
	});

	//Reinitialize masonry inside each panel after the relative tab link is clicked - 
	$('a[data-toggle=tab]').each(function () {
		var $this = $(this);

		$this.on('shown.bs.tab', function () {

			$container.imagesLoaded().progress(function () {
				$container.masonry({
					columnWidth: '.item',
					itemSelector: '.item'
				});
			});
		}); //end shown
	}); //end each
})(jQuery);
//# sourceMappingURL=main.js.map

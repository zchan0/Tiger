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

//logout function
$('#logoutBtn').click(function () {
    var logout = $.ajax({
        type: 'POST',
        dataType: 'JSON',
        url: 'user/logout.json',
        success: function success(resultsData, status) {
            var results = JSON.parse(resultsData);
            if (results.success === 'true') {
                console.log('logout success');
                window.location.href = 'index.html';
            } else if (results.success === 'false') {
                console.log('logout failure');
            }
        }
    });
});

//get init data function
function getAllContent() {
    var data = {
        start: 0,
        pagesize: 10
    };
    data = JSON.stringify(data);

    $.ajax({
        type: 'POST',
        data: data,
        dataType: 'JSON',
        url: 'content/batchquery.json',
        success: function success(resultsData, status) {
            var results = JSON.parse(resultsData);
            if (results.success === 'true') {
                console.log('batchquery success');
                var myContents = results.myContents;
                var document = document.getElementById('container');
                for (i = 0; i < contents.length; i++) {
                    //element i
                    var _contents = myContents[i];

                    //basic set of DOM!
                    var item = document.createElement('div');
                    item.setAttribute('class', 'col-md-4 col-sm-6 item');

                    var thumbnail = document.createElement('div');
                    thumbnail.setAttribute('class', 'thumbnail');

                    var image = document.createElement('img');
                    image.setAttribute('alt', '');

                    var caption = document.createElement('div');
                    caption.setAttribute('class', 'caption');

                    var h3 = document.createElement('h3');
                    var p1 = document.createElement('p');
                    var p2 = document.createElement('p');

                    var a1 = document.createElement('a');
                    a1.setAttribute('href', '#');
                    a1.setAttribute('class', 'btn btn-default');
                    a1.setAttribute('role', 'button');
                    a1.setAttribute('id', 'selectBtn');
                    a1.innerHTML = 'select';
                    p2.appendChild(a);

                    var a2 = document.createElement('a');
                    a1.setAttribute('href', '#');
                    a1.setAttribute('class', 'btn btn-alert');
                    a1.setAttribute('role', 'button');
                    a1.setAttribute('id', 'deleteBtn');
                    a1.innerHTML = 'select';
                    a2.innerHTML = 'button';
                    p2.appendChild(a);
                    //end of basic set of DOM!

                    //start to input contents to DOM!
                    p1.innerHTML = _contents.contents[0].text;
                    h3.innerHTML = 'Label';

                    caption.appendChild(h3);
                    caption.appendChild(p1);
                    caption.appendChild(p2);

                    image.setAttribute('src', _contents.contents[0].picName);

                    thumbnail.appendChild(image);
                    thumbnail.appendChild(caption);

                    item.appendChild(thumbnail);
                    item.setAttribute('id', _contents.id);
                    //end of input contents to DOM!

                    document.getElementById('gridContainer').appendChild(item);
                }
            } else if (results.success === 'false') {
                console.log('batchquery failure');
                alert('cannot get contents!');
            }
        }
    });
}

//delete item function
function deleteItem(button) {
    var content = button.parentNode.parentNode.parentNode.parentNode;
    console.log('this element:', content.id.value);
    var container = content.parentNode;
    console.log('this container:', container);
    container.removeChild(content);

    //need to connnect to server!
}

//haven't let the pic show on page!
//upload function
$('#uploadBtn').click(function () {
    var formdata = new FormData();
    formdata.append('image', $('#uploadFileInput')[0].files[0]);
    formdata.append('imageLabel', $('#imageLabel').value);
    formdata.append('description', $('#description').value);

    var login = $.ajax({
        url: 'content/publish.json',
        type: 'POST',
        cache: false,
        data: formdata,
        processData: false,
        contentType: false,
        success: function success(resultsData, status) {
            var results = JSON.parse(resultsData);
            if (results.success === 'true') {
                console.log('upload success');
                //close modal
                $('#closeModal').click();
                //$('#uploadModal').modal('hide');
            } else if (results.success === 'false') {
                console.log('logout failure');
                alert('upload failed, please upload again!');
            }
        }
    });
});

//show modal uploading function
$('#loading').ajaxStart(function () {
    $(this).show();
}) //when uploading images, show the icon
.ajaxComplete(function () {
    $(this).hide();
}); //hide it when uploaded.
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
})(jQuery);
//# sourceMappingURL=main.js.map

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
                rememberPassword();
            } else if (results.success === 'false') {
                console.log('login failed');
                // show login error message
                $('#alertDiv').removeClass('hidden');
            }
        }
    });
});

function rememberPassword() {
    if ($('#remember').is(':checked')) {
        var username = $('#username').val();
        var password = $('#password').val();
        // set cookies to expire in 14 days
        Cookies.set('username', username, { expires: 14 });
        Cookies.set('password', password, { expires: 14 });
        Cookies.set('remember', true, { expires: 14 });
    } else {
        // reset cookies
        Cookies.set('username', null);
        Cookies.set('password', null);
        Cookies.set('remember', null);
    }
}

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

$(document).ready(function () {
    var remember = Cookies.get('remember');
    if (remember === 'true') {
        var username = Cookies.get('username');
        var password = Cookies.get('password');
        // autofill the fields
        $('#username').val(username);
        $('#password').val(password);
        $('#remember').prop('checked', true);
    }
});

//container
//var $container = $('.masonry-container');
//$container.imagesLoaded( function() {
//    $container.masonry({
//        columnWidth: '.item',
//        itemSelector: '.item',
//    });
//});

// share
$('#shareBtn').click(function () {
    var selectedItemID = getSelectedItemID();
    var username = $('#logoutBtn').data('username');
    $.ajax({
        url: 'content/share.json',
        type: 'POST',
        dataType: 'JSON',
        data: { id: selectedItemID }
    }).done(function (resultsData, textStatus, jqXHR) {
        console.log(resultsData);
        var results = $.parseJSON(resultsData);
        if (results.success === 'true') {
            var host = $(location).attr('hostname');
            var protocol = $(location).attr('protocol');
            var port = $(location).attr('port');
            var path = '/yolk/share.html';
            $('#shareURLForm').val(protocol + '//' + host + ':' + port + path + '?username=' + username + '&id=' + results.id);
            $('#shareModal').modal('toggle');
        } else if (results.success === 'false') {
            console.log('share failed');
        }
    });
});

function getSelectedItemID() {
    return $('.active').attr('id');
}

function loadShareContent() {
    var ids = $.urlParam('id');
    $.ajax({
        url: 'content/query.json',
        type: 'POST',
        dataType: 'JSON',
        data: { id: ids }
    }).done(function (resultsData, textStatus, jqXHR) {
        console.log(resultsData);
        if (results.success === 'true') {
            var _results = $.parseJSON(resultsData);
            var contents = _results.shareContent;
            createShareContentDOM(contents);
        } else if (results.success === 'false') {
            console.log('load content failed');
        }
    });
}

function createShareContentDOM(shareContent) {
    // [username] share to you
    var username = shareContent[0].sharedByUsername;
    var a = $('<a></a>', {
        href: '#',
        text: username
    });
    var p = $('<p></p>', {
        'class': 'lead share-user',
        text: ' share to you'
    }).prepend(a);
    var hr = $('<hr>');

    $('#shareContainer').append(p, hr);

    // img + text
    for (var i = shareContent.length - 1; i >= 0; i--) {
        var contents = shareContent[i].contents;
        for (var j = contents.length - 1; j >= 0; j--) {
            var content = contents[i];
            var src = 'pic/download.json?username=' + username + '&fileName=' + content.picName;
            var img = $('<img>', {
                src: src
            });
            var text = $('<p></p>', {
                'class': 'lead',
                text: content.text
            });
            $('#shareContainer').append(img, text);
        }
    }

    // footer
    var footerText = $('<p></p>', {
        'class': 'pull-right',
        text: '❤️  from the Yolk team'
    });
    var footer = $('<div></div>', {
        'class': 'footer'
    }).append(footerText);
    $('#shareContainer').append(footer);
}

//get init data function
function getAllContent() {
    var data = 'start=0&pagesize=10';
    console.log('data:', data);

    $.ajax({
        type: 'POST',
        data: data,
        dataType: 'JSON',
        url: 'content/batchquery.json',
        success: function success(resultsData, status) {

            var results = JSON.parse(resultsData);
            //            console.log('success',results.success);
            //            console.log('myContents',results.myContents);
            //            console.log('results',results);

            if (results.success === 'true') {
                console.log('batchquery success');

                var myContents = results.myContents;
                console.log('mycontents', myContents);

                var uname = myContents[0].sharedByUsername;
                // store username in logout button for later use
                $('#logoutBtn').data('username', uname);

                for (var i = 0; i < myContents.length; i++) {
                    //element i
                    var contents = myContents[i];
                    console.log('contents', contents);

                    var $sharePanel = $('<div role="tabpanel" class="tab-pane"></div>');
                    var $shareContainer = $('#gridContainer').clone(true);
                    //delete children
                    $shareContainer.empty();
                    var $origin = $('#origin').clone(true);
                    $origin.attr('id', contents.id);
                    $shareContainer.append($origin);

                    //give masonry property
                    //                    $shareContainer.imagesLoaded( function() {
                    //                        $shareContainer.masonry({
                    //                            columnWidth: '.item',
                    //                            itemSelector: '.item',
                    //                        });
                    //                    });

                    if (i === 0) {
                        $('.active').attr('id', contents.id);
                        $shareContainer = $('#gridContainer');
                    } else {
                        //create new panel!
                        var $li = $('<li role="presentation"></li>');
                        $li.attr('id', contents.id);

                        var $a = $('<a data-toggle="tab" role="tab"></a>');
                        var tag = 'share-' + (i + 1).toString();
                        $a.attr('href', '#' + tag);
                        $a.attr('aria-controls', tag);
                        $a.append(tag);
                        $li.append($a);

                        $('[role="tablist"]').append($li);

                        $sharePanel.attr('id', tag);
                        $sharePanel.append($shareContainer);
                        $shareContainer.attr('id', tag);
                        //                        shareContainer.setAttribute('id',tag);
                    }
                    $('#inputPanelHere').append($sharePanel);

                    for (var j = 0; j < contents.contents.length; j++) {

                        //element of share i
                        //clone origin
                        var $item = $('#origin').clone(true);
                        //                        let item = document.createElement('div');
                        //                        item.setAttribute('class','col-md-4 col-sm-6 item');
                        //
                        //                        let thumbnail = document.createElement('div');
                        //                        thumbnail.setAttribute('class','thumbnail');
                        //
                        //                        let caption = document.createElement('div')
                        //                        caption.setAttribute('class','caption');
                        //
                        //                        let h3 = document.createElement('h3');
                        //                        let p1 = document.createElement('p');
                        //                        let p2 = document.createElement('p');
                        //
                        //                        let a1 = document.createElement('a');
                        //                        a1.setAttribute('href','#');
                        //                        a1.setAttribute('class','btn btn-default');
                        //                        a1.setAttribute('role','button');
                        //                        a1.setAttribute('id','selectBtn');
                        //                        a1.innerHTML = 'select';
                        //                        p2.appendChild(a1);
                        //
                        //                        let a2 = document.createElement('a');
                        //                        a2.setAttribute('href','#');
                        //                        a2.setAttribute('class','btn btn-danger');
                        //                        a2.setAttribute('role','button');
                        //                        a2.setAttribute('id','deleteBtn');
                        //                        a2.innerHTML = 'select';
                        //                        a2.innerHTML = 'button';
                        //                        p2.appendChild(a2);
                        //end of basic set of DOM!

                        //start to input contents to DOM!
                        $item.find('#description').html(contents.contents[j].text);
                        //                        p1.innerHTML = contents.contents[j].text;
                        //                        h3.innerHTML = 'Description';
                        //
                        //                        caption.appendChild(h3);
                        //                        caption.appendChild(p1);
                        //                        caption.appendChild(p2);

                        //if has picture, add img element!
                        if (contents.contents[j].hasOwnProperty('picName')) {
                            //                            console.log('have picture');
                            //                            let image = document.createElement('img');
                            //                            image.setAttribute('alt','');
                            //                            let src = '/yolk/pic/download.json?username='+contents.sharedByUsername+'&fileName='+contents.contents[j].picName;
                            $item.find('#image').attr('src', 'pic/download.json?username=' + contents.sharedByUsername + '&fileName=' + contents.contents[j].picName);
                            //                            image.setAttribute('src',src);

                            //                            thumbnail.appendChild(image);
                        } else {
                            $item.find('#image').remove();
                            console.log('don\'t have image');
                        }
                        //end of adding img

                        //                        thumbnail.appendChild(caption);
                        //                        item.appendChild(thumbnail);
                        //                        item.setAttribute('id',contents.id);
                        $item.attr('id', contents.id);
                        //end of input contents to DOM!

                        //use masonry to add new item
                        $shareContainer.masonry().append($item).masonry('appended', $item);
                    }
                    $shareContainer.masonry('layout');
                    //basic set of DOM!

                    //add a divider of each share. not working???
                    //                    let ul = document.createElement('ul');
                    //                    ul.setAttribute('class','nav nav-list');
                    //                    let divider = document.createElement('li');
                    //                    divider.setAttribute('class','divider');
                    //                    ul.appendChild(divider);
                    //                    $container.masonry().append(ul).masonry('appended',ul);
                }
            } else if (results.success === 'false') {
                console.log('batchquery failure');
                window.location.href = '404.html';
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
        fileElementId: '1',
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

// dismiss login error message
$('#alertDiv').click(function () {
    $(this).addClass('hidden');
});

/** Helpers */
$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    } else {
        return results[1] || 0;
    }
};

/** Plugin methods */

$('#signupForm').validate();
$('#loginForm').validate();

(function ($) {
    var $container = $('.masonry-container');
    $container.imagesLoaded().progress(function () {
        $container.masonry({
            columnWidth: '.item',
            itemSelector: '.item'
        });
    });

    $('a[data-toggle=tab]').each(function () {
        var $this = $(this);

        $this.on('shown.bs.tab', function () {
            $container.imagesLoaded(function () {
                $container.masonry({
                    columnWidth: '.item',
                    itemSelector: '.item'
                });
            });
        });
    });
})(jQuery);
//# sourceMappingURL=main.js.map

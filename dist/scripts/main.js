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
    return $('[class="tab-pane active"]').attr('id');
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
        var results = $.parseJSON(resultsData);
        if (results.success === 'true') {
            createShareContentDOM(results.shareContent);
        } else if (results.success === 'false') {
            console.log('load content failed');
        }
    });
}

function createShareContentDOM(shareContent) {
    // [username] share to you
    console.log(shareContent);
    var username = shareContent.sharedByUsername;
    console.log('username:', username);
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
    var contents = shareContent.contents;
    console.log('shareContent.contents: ', contents);
    for (var i = contents.length - 1; i >= 0; i--) {
        var content = contents[i];
        var text = $('<p></p>', {
            'class': 'lead',
            text: content.text
        });
        if (content.picName != undefined) {
            console.log('has picture');
            var src = 'pic/download.json?username=' + username + '&fileName=' + content.picName;
            var img = $('<img>', {
                src: src
            });
            $('#shareContainer').append(img, text);
        } else {
            $('#shareContainer').append(text);
        }
        if (i != 0) {
            $('#shareContainer').append(hr);
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

    $.ajax({
        type: 'POST',
        data: data,
        dataType: 'JSON',
        url: 'content/batchquery.json',
        success: function success(resultsData, status) {
            // stop loading
            $('#loader').addClass('hidden');

            var results = JSON.parse(resultsData);

            if (results.success === 'true') {
                (function () {
                    var myContents = results.myContents;
                    console.log('myContents', myContents);

                    var username = myContents[0].sharedByUsername;
                    // store username in logout button for later use
                    $('#logoutBtn').data('username', username);

                    // structure
                    var tabPanel = $('<div/>', {
                        'role': 'tabpanel'
                    }).appendTo('#mainContainer');

                    var navTabs = $('<ul/>', {
                        'role': 'tablist',
                        'class': 'nav nav-tabs'
                    });
                    var tabContent = $('<div/>', {
                        'class': 'tab-content'
                    });
                    tabPanel.append(navTabs, tabContent);

                    // myContents.count

                    var _loop = function _loop(i) {
                        // nav tabs
                        var apanel = $('<a/>', {
                            'href': '#panel-' + (i + 1),
                            'role': 'tab',
                            'data-toggle': 'tab',
                            'id': '#panel-' + (i + 1),
                            'aria-controls': 'panel-' + (i + 1),
                            'text': 'Panel ' + (i + 1)
                        });
                        var panel = $('<li/>', {
                            'role': 'presentation'
                        }).append(apanel);
                        navTabs.append(panel);

                        // tab panes
                        var tabPane = $('<div/>', {
                            'role': 'tabpanel',
                            'class': 'tab-pane',
                            'id': myContents[i].id
                        }).appendTo(tabContent);

                        // default set panel 1 active
                        if (i == 0) {
                            panel.addClass('active');
                            tabPane.addClass('active');
                        }

                        var masonryContainer = $('<div/>', {
                            'class': 'row masonry-container'
                        }).appendTo(tabPane);

                        // relayout when switching panel
                        panel.on('shown.bs.tab', function (event) {
                            event.preventDefault();
                            layout(masonryContainer);
                        });

                        var contents = myContents[i].contents;

                        var _loop2 = function _loop2(j) {
                            var item = $('<div/>', {
                                'class': 'col-md-4 col-sm-6 item'
                            }).appendTo(masonryContainer);

                            var thumbnail = $('<div/>', {
                                'class': 'thumbnail'
                            }).appendTo(item);

                            // construct content
                            var content = contents[j];
                            // img div
                            if (content.picName) {
                                var img = $('<img>', {
                                    'src': 'pic/download.json?username=' + username + '&fileName=' + content.picName
                                }).appendTo(thumbnail);
                            }

                            // caption div
                            var caption = $('<div/>', {
                                'class': 'caption'
                            }).appendTo(thumbnail);

                            // $('<h3>', {
                            //     text: 'Thumbnail label',
                            // }).appendTo(caption);
                            if (content.text) {
                                $('<p>', {
                                    text: content.text
                                }).appendTo(caption);
                            }
                            var delBtn = $('<a>', {
                                'href': '#',
                                'class': 'btn btn-danger',
                                'role': 'button',
                                text: 'Delete'
                            });
                            delBtn.on('click', function (event) {
                                event.preventDefault();
                                $.ajax({
                                    url: 'content/delete.json',
                                    type: 'POST',
                                    dataType: 'JSON',
                                    data: { id: myContents[i].id }
                                }).done(function (resultsData, textStatus, jqXHR) {
                                    console.log('delete: ', resultsData);
                                    var results = $.parseJSON(resultsData);
                                    if (results.success === 'true') {
                                        delBtn.parents('.item').remove();
                                        layout(masonryContainer);
                                    } else {
                                        alert(results.errorMsg);
                                    }
                                });
                            });
                            $('<p>').append(delBtn).appendTo(caption);
                        };

                        for (var j = 0; j < contents.length; ++j) {
                            _loop2(j);
                        } // end for contents

                        // init layout after all elements created
                        layout(masonryContainer);
                    };

                    for (var i = 0; i < myContents.length; ++i) {
                        _loop(i);
                    } // end for myContents

                    // footer
                    var footerText = $('<p></p>', {
                        'class': 'pull-right',
                        text: '❤️  from the Yolk team'
                    });
                    var footer = $('<div></div>', {
                        'class': 'footer'
                    }).append(footerText);
                    $('#mainContainer').append(footer);
                })();
            } else if (results.success === 'false') {
                console.log('batchquery failure');
                window.location.href = '404.html';
            }
        }
    });
}

//delete item function
function deleteItem(button) {}

//for textContent
var textContent = {};
//for image name
var picContent = {};
//for count
var count = 0;

//upload only one file each time
function uploadOneFile(a) {
    $ajaxFileUpload({
        url: 'pic/upload.json',
        secureuri: false,
        fileElementId: 'uploadFileInput',
        dataType: 'json',
        success: function success(data, status) {
            alert(data);
            var result = JSON.parse(data);
            if (result.success === true) {
                alert(data);
            } else {
                alert(data);
            }
        },
        error: function error(data, status, e) {
            alert(e);
        }
    });
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

function getFileUrl(sourceId) {
    var url;
    if (navigator.userAgent.indexOf("MSIE") >= 1) {
        // IE
        url = document.getElementById(sourceId).value;
    } else if (navigator.userAgent.indexOf("Firefox") > 0) {
        // Firefox
        url = window.URL.createObjectURL(document.getElementById(sourceId).files.item(0));
    } else if (navigator.userAgent.indexOf("Chrome") > 0) {
        // Chrome
        url = window.URL.createObjectURL(document.getElementById(sourceId).files.item(0));
    }
    return url;
}

function preImg(sourceId, targetId) {
    var url = getFileUrl(sourceId);
    var imgPre = document.getElementById(targetId);
    imgPre.src = url;
    imgPre.style.display = "block";
}

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

function layout(masonryContainer) {
    masonryContainer.imagesLoaded(function () {
        masonryContainer.masonry({
            columnWidth: '.item',
            itemSelector: '.item'
        });
    });
}
//# sourceMappingURL=main.js.map

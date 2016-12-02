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
	 let logout = $.ajax({
	 	type: 'POST',
	 	dataType: 'JSON',
	 	url: 'user/logout.json',
	 	success: function(resultsData, status) {
	 		let results = JSON.parse(resultsData);
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
function getAllContent(){
    let data = 'start=0&pagesize=10';
    console.log('data:',data);

    $.ajax({
        type: 'POST',
        data: data,
        dataType: 'JSON',
        url: 'content/batchquery.json',
        success: function (resultsData, status){
            console.log('jsonstring',resultsData);

	 		let results = JSON.parse(resultsData);
            console.log('success',results.success);
            console.log('myContents',results.myContents);
            console.log('results',results);

            //container
            let $container = $('#gridContainer');
            $container.masonry({
                ifFitWidth: true,
                itemSelector: '.col-md-4 col-sm-6 item'
            });

            if (results.success === 'true') {
                console.log('batchquery success');

                let myContents = results.myContents;
                console.log('mycontents',myContents);

                for(i=0;i<myContents.length;i++){
                    //element i
                    let contents = myContents[i];
                    console.log('contents',contents);

                    for(j=0;j<contents.contents.length;j++){

                        //element of share i
                        let item = document.createElement('div');
                        item.setAttribute('class','col-md-4 col-sm-6 item');

                        let thumbnail = document.createElement('div');
                        thumbnail.setAttribute('class','thumbnail');

                        let caption = document.createElement('div')
                        caption.setAttribute('class','caption');

                        let h3 = document.createElement('h3');
                        let p1 = document.createElement('p');
                        let p2 = document.createElement('p');

                        let a1 = document.createElement('a');
                        a1.setAttribute('href','#');
                        a1.setAttribute('class','btn btn-default');
                        a1.setAttribute('role','button');
                        a1.setAttribute('id','selectBtn');
                        a1.innerHTML = 'select';
                        p2.appendChild(a1);

                        let a2 = document.createElement('a');
                        a2.setAttribute('href','#');
                        a2.setAttribute('class','btn btn-danger');
                        a2.setAttribute('role','button');
                        a2.setAttribute('id','deleteBtn');
                        a2.innerHTML = 'select';
                        a2.innerHTML = 'button';
                        p2.appendChild(a2);
                        //end of basic set of DOM!

                        //start to input contents to DOM!
                        p1.innerHTML = contents.contents[j].text;
                        h3.innerHTML = 'Description';

                        caption.appendChild(h3);
                        caption.appendChild(p1);
                        caption.appendChild(p2);

                        //if has picture, add img element!
                        if(contents.contents[j].hasOwnProperty('picName')){
                            console.log('have picture');
                            let image = document.createElement('img');
                            image.setAttribute('alt','');
                            let src = '/yolk/pic/download.json?username='+contents.sharedByUsername+'&fileName='+contents.contents[j].picName;
                            image.setAttribute('src',src);

                            thumbnail.appendChild(image);
                        }
                        else{
                            console.log("don't have image");
                        }
                        //end of adding img

                        thumbnail.appendChild(caption);
                        item.appendChild(thumbnail);
                        item.setAttribute('id',contents.id);
                        //end of input contents to DOM!

                        //use masonry to add new item
                        $container.masonry().append(item).masonry('appended',item);
                    }
                    //basic set of DOM!

                    //add a divider of each share. not working???
                    let ul = document.createElement('ul');
                    ul.setAttribute('class','nav nav-list');
                    let divider = document.createElement('li');
                    divider.setAttribute('class','divider');
                    ul.appendChild(divider);
                    $container.masonry().append(ul).masonry('appended',ul);
                }
            } else if (results.success === 'false') {
                console.log('batchquery failure');
                alert('cannot get contents!');
            }
        }
    });
}

//delete item function
function deleteItem(button){
    let content = button.parentNode.parentNode.parentNode.parentNode;
    console.log('this element:',content.id.value);
    let container = content.parentNode;
    console.log('this container:',container);
    container.removeChild(content);

    //need to connnect to server!
}


//haven't let the pic show on page!
//upload function
$('#uploadBtn').click(function () {
    let formdata = new FormData();
    formdata.append('image',$('#uploadFileInput')[0].files[0]);
    formdata.append('imageLabel',$('#imageLabel').value);
    formdata.append('description',$('#description').value);

    let login = $.ajax({
        url: 'content/publish.json',
        type: 'POST',
        cache: false,
        data: formdata,
        processData: false,
        contentType: false,
        success: function(resultsData, status) {
            let results = JSON.parse(resultsData);
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
$('#loading')
    .ajaxStart(function () {
        $(this).show();
    })//when uploading images, show the icon
    .ajaxComplete(function () {
        $(this).hide();
    });//hide it when uploaded.
$('#signupForm').validate();
$('#loginForm').validate();

// dismiss login error message
$('#alertDiv').click(function () {
	 $(this).addClass('hidden');
});

(function( $ ) {
	var $container = $('.masonry-container');
	$container.imagesLoaded().progress( function () {
		$container.masonry({
			columnWidth: '.item',
			itemSelector: '.item'
		});
	});
}) (jQuery);

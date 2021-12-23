$(document).ready(function () {
  // Bấm vào comment btn sẽ hiện các comment dưới bài viết
  $('.comments_expand').one('click', e => {
    e.preventDefault();
    let postId = $(e.target).closest('.post_id').data('postid');
    $.ajax({
      url: '/api/post/' + postId,
      method: 'GET',
      async: true,
      beforeSend: function () {
        $('#comment_loading_' + postId).removeClass('d-none');
      },
      success: function (data) {
        const comments = data.post.comments.length;
        for (var i = 0; i < comments; i++) {
          let commentsTemplate = Handlebars.compile(
            $('.comment_data_template_' + postId).html()
          );

          let dataStamp = {
            comments: data.post.comments[i],
          };
          var template = commentsTemplate(dataStamp);
          $('.comment_container_' + postId).html(template);
        }
        $('#comment_' + postId).removeClass('d-none');
        $('#comment_loading_' + postId).addClass('d-none');
      },
      error: function () {
        alert('error');
      },
    });
  });

  //create_post_option
  //function upload img
  function img_upload() {
    document.getElementById('file').click();
  }
  input_img = document.getElementById('input_img');

  var loadFile = function (event) {
    var reader = new FileReader();
    reader.onload = function () {
      var output = document.getElementById('review_img');
      output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
    input_img.style.display = 'none';
  };

  //remove img
  //auto resize text area
  const tx = document.getElementsByClassName('comment_input');
  for (let i = 0; i < tx.length; i++) {
    tx[i].setAttribute(
      'style',
      'height:' + tx[i].scrollHeight + 'px;overflow-y:hidden;'
    );
    tx[i].addEventListener('input', OnInput, false);
  }
  function OnInput() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  }
});

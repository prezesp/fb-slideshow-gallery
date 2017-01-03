function build_photo (val, big_div) {
  var div  = $('<div/>').attr('class', 'medium-2 columns app-album-photo');
  var link = $('<p/>');
  link.html("<small>"+val['name'].slice(0, 40) + (val['name'].length > 40 ? "..." : "")+"</small>");
  var img  = $('<img/>').attr('src', val['picture']['url']);
  div.append(img);
  div.append(link);
  div.on("click", function() {
    Creator.selectAlbum(val['id'], div);
  })

  big_div.append(div);
}


var Creator = {
  getAlbums : function(pageId) {
    $('#app-albums').html("");

    $.ajax({
        type: 'GET',
        url: 'server.php?page='+pageId
    }).done(function (data) {
        var i = 0;
        var big_div;
        for (val of data)
        {
          if (val['picture'] == undefined) continue;
          if (i++ % 6 == 0) {
            big_div = $('<div/>').attr('class', 'row');
            $('#app-albums').append(big_div)
          }
          build_photo(val, big_div);
        }
        for (i=0; i < 7 - (data.length % 6) && data.length % 6 != 0; i++)
        {
          var div2 = $('<div/>').attr('class', 'medium-2 columns');
          div2.html('&nbsp;');
          big_div.append(div2)
        }

    });

  },
  selectAlbum : function(albumId, div) {
    FBPhotoExplorer.reset();
    FBPhotoExplorer.init(albumId);

    $.get('snippet-template.html', function(data) {
      var pageAddress = window.location.href.replace('creator.html', '');
      data = data.replace(':albumId:', albumId);
      data = data.replace(':pageAddress:', pageAddress);
      data = data.replace(':pageAddress:', pageAddress);
      $(".app-code").text(data).html();
    });
    $(".app-album-photo-selected").each(function(i, obj) {
      $(obj).removeClass("app-album-photo-selected");
    });
    div.addClass("app-album-photo-selected");
  }
};



var FBPhotoExplorer = {
  loadedPhotos: 0,
  currentPage: 0,
  loadedAll: false,
  limit : 6,
  reset : function() {
    $('.app-inner').empty();
    $('.app-inner').css('width', 0);
    $('.app-inner').css('left', 0);
  },
  init : function(album_id) {
    var loadingDiv = $('<div/>').attr('class', 'app-loader');
    $('.app-outer').append(loadingDiv);
    $('.app-inner').css('opacity', 0);
    $('.app-inner').css('display', 'none');



    var loadingInnerDiv = $('<div/>');
    loadingInnerDiv.append($('<i/>').attr('class', 'fi-refresh'));
    loadingDiv.append(loadingInnerDiv);

    this.album_id = album_id;
    this.currentPage = 0;
    this.loadedPhotos = 0;
    this.loadedAll = false;
    this.isLoading = false;

    var that = this;
    this.load("&limit=12", function(loaded) {
      that.isLoading = false;
      that.loadedPhotos += loaded;
      $(loadingDiv).animate({
        opacity: 0
      }, {
        duration: 250,
        complete : function() {
          $(loadingDiv).css('display', 'none');
          $('.app-inner').css('display', 'block');
          $('.app-inner').animate({
            opacity: 1
          }, 250 );
        }
      });

      if (loaded != 12) {
        that.loadedAll = true;
      }
    });
  },
  next : function () {
    var that = this;
    // czy przesunąć
    if ((this.currentPage+1)*6 < this.loadedPhotos && !this.isLoading) {
      that.currentPage+=1;

      $('.app-inner').animate({
        left: "-=900"
      }, 820, function() {
      });
    }
    // czy jeszcze wczytywać
    if (!this.loadedAll && !that.isLoading) {
      this.isLoading = true;
      var get_path = "&after=" + this.next_link;
      this.load(get_path, function(loaded) {
        that.loadedPhotos += loaded;
        that.isLoading = false;
        if (loaded != 6) {
          that.loadedAll = true;
        }
      });
    }

  },
  previous : function() {
    var that = this;
    if (this.currentPage > 0) {
      that.currentPage -= 1;
      $('.app-inner').animate({
        left: "+=900"
      }, 820, function() {
      });
    }

  },
  load : function(get_path, callback) {
    var lim = this.limit;
    var that = this;
    $.ajax({
        type: 'GET',
        url: 'server.php?album='+this.album_id+get_path
    }).done(function (response) {
      if (response['next'] == null) {
        that.loadedAll = true;
      }

      FBPhotoExplorer.next_link = response['next'];


      var i=0;
      var big_div;
      for (val of response['data'])
      {
        if (i++ % 6 == 0) {
          big_div = $('<div/>').attr('class', 'row app-photos');
          $('.app-inner').css('width', $('.app-inner').width() + 900);
          $('.app-inner').append(big_div);
        }
        var div  = $('<div/>').attr('class', 'app-div medium-2 columns');
        var link = $('<a/>').attr('href', val['link']).attr('target', '_blank');
        var img  = $('<img/>').attr('src', val['picture']).attr('class', 'app-image');
        link.append(img);
        div.append(link);
        big_div.append(div)
      }
      for (var i=0; i < 7 - (response['data'].length % 6) && response['data'].length % 6 != 0; i++)
      {
        var div = $('<div/>').attr('class', 'medium-2 columns');
        big_div.append(div)
      }

      callback(response['data'].length);
    });
  }
};

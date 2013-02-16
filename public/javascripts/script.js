var forEach  = Array.prototype.forEach;

var ImageView = Backbone.View.extend({
  tagName : 'a',

  initialize : function(){
    this.img = document.createElement('img');
    this.$img = $(this.img);
    this.$el.append(this.$img);

    this.loading = document.createElement('span');
    this.$loading = $(this.loading);
    this.$el.append(this.$loading);

    this.model.on('change:filename', this.renderSRC, this);
    this.model.on('change:loading', this.renderLoading, this);

    this.render();
  },

  renderSRC : function(){
    var src = (this.model.get('filename'))? 'statics/images/'+this.model.get('filename') : window.URL.createObjectURL(this.model.get('file'));

    this.img.src = (this.model.get('filename'))? src + '?preview=true': src ;


    this.img.title = this.model.get('filename');
    this.el.href = src;
  },

  renderLoading : function(){
    if(this.model.get('loading') === 100) this.$loading.remove();
    else this.$loading.width((100-this.model.get('loading')) + '%');
  },

  render : function(){
    this.renderSRC();
    this.renderLoading();
    return this;
  }
});

var AudioView = Backbone.View.extend({
  tagName : 'a',

  initialize : function(){
    this.audio = document.createElement('audio');
    this.$audio = $(this.audio);
    this.$el.append(this.$audio);

    this.audio.controls = "controls";

    this.loading = document.createElement('span');
    this.$loading = $(this.loading);
    this.$el.append(this.$loading);

    this.model.on('change:filename', this.renderSRC, this);
    this.model.on('change:loading', this.renderLoading, this);

    this.render();
  },

  renderSRC : function(){
    var src = (this.model.get('filename'))? 'statics/images/'+this.model.get('filename') : window.URL.createObjectURL(this.model.get('file'));

    var source = document.createElement('source');

    source.src = src;
    source.type = this.model.get('type');

    this.$audio.append(source);

  },

  renderLoading : function(){
    if(this.model.get('loading') === 100) this.$loading.remove();
    else this.$loading.width((100-this.model.get('loading')) + '%');
  },

  render : function(){
    this.$audio.empty();
    this.audio.innerHTML = 'Your browser does not support the <code>audio</code> element.';
    this.renderSRC();
    this.renderLoading();
    return this;
  }
});

var VideoView = Backbone.View.extend({
  tagName : 'a',

  initialize : function(){
    this.video = document.createElement('video');
    this.$video = $(this.video);
    this.$el.append(this.$video);

    this.video.controls = "controls";

    this.loading = document.createElement('span');
    this.$loading = $(this.loading);
    this.$el.append(this.$loading);

    this.model.on('change:filename', this.renderSRC, this);
    this.model.on('change:loading', this.renderLoading, this);

    this.render();
  },

  renderSRC : function(){
    var src = (this.model.get('filename'))? 'statics/images/'+this.model.get('filename') : window.URL.createObjectURL(this.model.get('file'));

    var source = document.createElement('source');

    source.src = src;
    source.type = this.model.get('type');

    this.$video.append(source);

  },

  renderLoading : function(){
    if(this.model.get('loading') === 100) this.$loading.remove();
    else this.$loading.width((100-this.model.get('loading')) + '%');
  },

  render : function(){
    this.$video.empty();
    this.video.innerHTML = 'Your browser does not support the <code>video</code> element.';
    this.renderSRC();
    this.renderLoading();
    return this;
  }
});

var View = Backbone.View.extend({
  initialize : function(){
    this.collection.on('add', this.addItem, this);
    this.collection.on('reset', this.render, this);

    this.content = document.createElement('div');
    this.$content = $(this.content);
    this.$el.append(this.$content);

    this.collection.fetch();
  },

  events : {
    'dragover' : 'dragover',
    'drop' : 'drop'
  },

  dragover : function(e){
    e.preventDefault();

    e.originalEvent.dataTransfer.dropEffect = 'copy';
  },

  drop : function(e){
    e.preventDefault();

    var collection = this.collection;
    var files = e.originalEvent.dataTransfer.files;

    _.each(files, function(file){
      if(!/^image\//.test(file.type) && !/^audio\//.test(file.type) && !/^video\//.test(file.type)) return;
      var form = new FormData();
      var reader = new FileReader();
      reader.onload = (function(f, form){
        return function(e){
          form.append('file', f);
        };
      })(file, form);

      reader.readAsDataURL(file);

      data = {
        file : file,
        type : file.type,
        filename : '',
        loading : 0
      };
      var model = collection.unshift(data);

      reader.onloadend = function(){
        $.ajax({
          url : '/images',
          data: form,
          cache: false,
          contentType: false,
          processData: false,
          type: 'POST',
          xhr: function() {
            var xhr = jQuery.ajaxSettings.xhr();
            if (xhr.upload) {
              xhr.upload.addEventListener('progress', progressHandler, false);
            }//if
            return xhr;
          },
          success: function(data){
            data.loading = 100;
            model.set(data);
          }
        }, 'json');
      };
      function progressHandler(evt) {
        if (evt.lengthComputable) {
          var percent_done = parseInt(100.0 * evt.loaded / evt.total, 10);
          model.set('loading', percent_done);
        }
      }
    });
  },

  addItem : function(model){
    var toadd = (/^image\//.test(model.get('type'))) ? new ImageView({
      model : model
    }).$el : (/^audio\//.test(model.get('type'))) ? new AudioView({
      model : model
    }).$el : (/^video\//.test(model.get('type'))) ? new VideoView({
      model : model
    }).$el : null;
    if(toadd !== null){
      if(this.collection.indexOf(model) === 0) this.$content.prepend(toadd);
      else  this.$content.append(toadd);
    }
  },

  render : function(){
    this.$content.empty();

    this.collection.forEach(this.addItem, this);

    return this;
  }
});

var Model = Backbone.Model.extend({
});

var Collection = Backbone.Collection.extend({
  url : '/images',
  model : Model,
  parse : function(data){
    return data.map(function(data){
      data.loading = 100;
      return data;
    });
  }
});

$(function(){
  window.view = new View({
    el : $('#dropzone'),
    collection : new Collection()
  });
});
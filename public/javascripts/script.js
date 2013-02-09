var forEach  = Array.prototype.forEach;

var ItemView = Backbone.View.extend({
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
    var src = (this.model.get('filename'))? 'statics/'+this.model.get('filename') : window.URL.createObjectURL(this.model.get('file'));

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
      if(!/^image\//.test(file.type)) return;
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
          console.log(evt.loaded, evt.total);
          var percent_done = parseInt(100.0 * evt.loaded / evt.total, 10);
          model.set('loading', percent_done);
        }
      }
    });
  },

  addItem : function(model){
    var toadd = new ItemView({
      model : model
    }).$el;
    if(this.collection.indexOf(model) === 0) this.$content.prepend(toadd);
    else  this.$content.append(toadd);
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
var forEach  = Array.prototype.forEach;

var ItemView = Backbone.View.extend({
  tagName : 'a',

  initialize : function(){
    this.img = document.createElement('img');
    this.$img = $(this.img);

    this.$el.html(this.$img);

    this.render();
  },

  render : function(){
    if(this.model){
      this.img.src = 'statics/' + this.model.get('filename') + '?preview=true';
      this.img.title = this.model.get('filename');


      this.el.href = 'statics/' + this.model.get('filename');
      this.el.alt = this.model.get('filename');
    }

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
      var form = new FormData();
      var reader = new FileReader();
      reader.onload = (function(f, form){
        return function(e){
          form.append('file', f);
        };
      })(file, form);

      reader.readAsDataURL(file);

      reader.onloadend = function(){
        $.ajax({
          url : '/images',
          data: form,
          cache: false,
          contentType: false,
          processData: false,
          type: 'POST',
          success: function(data){
            collection.unshift(data);
          }
        }, 'json');
      };
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
  model : Model
});

$(function(){
  window.view = new View({
    el : $('#dropzone'),
    collection : new Collection()
  });
});
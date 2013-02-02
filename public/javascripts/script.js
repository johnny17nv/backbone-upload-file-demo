var forEach  = Array.prototype.forEach;

var ItemView = Backbone.View.extend({
  tagName : 'img',

  initialize : function(){
    this.render();
  },

  render : function(){
    if(this.model){
      this.el.src = 'images/' + this.model.get('name');
      this.el.title = this.model.get('name');
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
            collection.add(data);
          }
        }, 'json');
      };
    });
  },

  addItem : function(model){
    this.$content.append(new ItemView({
      model : model
    }).$el);
    console.log(new ItemView({
      model : model
    }).$el);
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
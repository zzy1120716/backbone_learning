// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone.localStorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Todo Model
  // ----------

  // Our basic **Todo** model has `title`, `order`, and `done` attributes.
  /**
   * 基本的Todo模型，属性为：title，order，done
   */
  var Todo = Backbone.Model.extend({

    // Default attributes for the todo item.
    //设置默认的属性
    defaults: function() {
      return {
        title: "empty todo...",
        order: Todos.nextOrder(),
        done: false
      };
    },

    // Toggle the `done` state of this todo item.
    //设置任务完成状态
    toggle: function() {
      this.save({done: !this.get("done")});
    }

  });

  // Todo Collection
  // ---------------

  // The collection of todos is backed by *localStorage* instead of a remote
  // server.
  /**
   * Todo的一个集合，数据通过localStorage存储在本地
   */
  var TodoList = Backbone.Collection.extend({

    // Reference to this collection's model.
    //设置Collection的模型为Todo
    model: Todo,

    // Save all of the todo items under the `"todos-backbone"` namespace.
    //存储到浏览器，以todos-backbone命名的空间中
    //此函数为Backbone插件提供
    //地址：https://github.com/jeromegn/Backbone.localStorage
    localStorage: new Backbone.LocalStorage("todos-backbone"),

    // Filter down the list of all todo items that are finished.
    //获取所有已经完成的任务数组
    //这里的where在之前是没有的，但是语法上更清晰了
    //参考文档：http://backbonejs.org/#Collection-where
    done: function() {
      return this.where({done: true});
    },

    // Filter down the list to only todo items that are still not finished.
    //获取任务列表中未完成的任务数组
    //这里的where在之前是没有的，但是语法上更清晰了
    //参考文档：http://backbonejs.org/#Collection-where
    //var friends = new Backbone.Collection([
    //  {name: "Athos",      job: "Musketeer"},
    //  {name: "Porthos",    job: "Musketeer"},
    //  {name: "Aramis",     job: "Musketeer"},
    //  {name: "d'Artagnan", job: "Guard"},
    //]);
    //var musketeers = friends.where({job: "Musketeer"});
    //alert(musketeers.length);

    remaining: function() {
      return this.where({done: false});
    },

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    //获得下一个任务的排序序号，通过数据库中的记录数加1实现
    nextOrder: function() {
      if (!this.length) return 1;
      //last获取collection中最后一个元素
      return this.last().get('order') + 1;
    },

    // Todos are sorted by their original insertion order.
    //Backbone内置属性，指明collection的排序规则
    comparator: 'order'

  });

  // Create our global collection of **Todos**.
  //首先是创建一个全局的Todo的collection对象
  var Todos = new TodoList;

  // Todo Item View
  // --------------

  // The DOM element for a todo item...
  //TodoView，作用是控制任务列表
  var TodoView = Backbone.View.extend({

    //... is a list tag.
    //下面这个标签的作用是，把template模板中获取到的html代码放到这个标签中
    tagName:  "li",

    // Cache the template function for a single item.
    //获取一个任务条目的模板，缓存到这个属性上
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    //为每一个任务条目绑定事件
    events: {
      "click .toggle"   : "toggleDone",
      "dblclick .view"  : "edit",
      "click a.destroy" : "clear",
      "keypress .edit"  : "updateOnEnter",
      "blur .edit"      : "close"
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    //在初始化时设置对model的change事件的监听
    //设置对model的destroy的监听，保证页面数据和model数据一致
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      //这个remove是view的中的方法，用来清除页面中的dom
      this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the titles of the todo item.
    // 渲染todo中的数据到 item-template 中，然后返回对自己的引用this
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      this.input = this.$('.edit');
      return this;
    },

    // Toggle the `"done"` state of the model.
    // 控制任务完成或者未完成
    toggleDone: function() {
      this.model.toggle();
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    // 修改任务条目的样式
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    // 关闭编辑模式，并把修改内容同步到Model和界面
    close: function() {
      var value = this.input.val();
      if (!value) {
        //无值内容直接从页面清除
        this.clear();
      } else {
        this.model.save({title: value});
        this.$el.removeClass("editing");
      }
    },

    // If you hit `enter`, we're through editing the item.
    // 按下回车之后，关闭编辑模式
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    // 移除对应条目，以及对应的数据对象
    clear: function() {
      this.model.destroy();
    }

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  //AppView，功能是显示所有任务列表，
  //显示整体的列表状态（如：完成多少，未完成多少）
  //以及任务的添加。主要是整体上的一个控制
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    //绑定页面上主要的DOM节点
    el: $("#todoapp"),

    // Our template for the line of statistics at the bottom of the app.
    // 在底部显示的统计数据模板
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    // 绑定dom节点上的事件
    events: {
      "keypress #new-todo":  "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #toggle-all": "toggleAllComplete"
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    //在初始化过程中，绑定事件到Todos上，
    //当任务列表改变时会触发对应的事件。
    //最后从localStorage中fetch数据到Todos中。
    initialize: function() {

      this.input = this.$("#new-todo");
      this.allCheckbox = this.$("#toggle-all")[0];

      this.listenTo(Todos, 'add', this.addOne);
      this.listenTo(Todos, 'reset', this.addAll);
      this.listenTo(Todos, 'all', this.render);

      this.footer = this.$('footer');
      this.main = $('#main');

      Todos.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    // 更改当前任务列表的状态
    render: function() {
      var done = Todos.done().length;
      var remaining = Todos.remaining().length;

      if (Todos.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
      } else {
        this.main.hide();
        this.footer.hide();
      }
      //根据剩余多少未完成确定标记全部完成的checkbox的显示
      this.allCheckbox.checked = !remaining;
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    // 添加一个任务到页面id为todo-list的div/ul中
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$("#todo-list").append(view.render().el);
    },

    // Add all items in the **Todos** collection at once.
    // 把Todos中的所有数据渲染到页面,页面加载的时候用到
    addAll: function() {
      Todos.each(this.addOne, this);
    },

    //生成一个新Todo的所有属性的字典
    newAttributes: function() {
      return {
        title: this.input.val(),
        order: Todos.nextOrder(),
        done: false
      }
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    //创建一个任务的方法，使用backbone.collection的create方法。
    //将数据保存到localStorage,这是一个html5的js库。
    //需要浏览器支持html5才能用。
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      //创建一个对象之后会在backbone中动态调用Todos的add方法
      //该方法已绑定addOne。
      Todos.create({title: this.input.val()});
      this.input.val('');
    },

    // Clear all done todo items, destroying their models.
    //去掉所有已经完成的任务
    clearCompleted: function() {
      _.invoke(Todos.done(), 'destroy');
      return false;
    },

    //处理页面点击标记全部完成按钮
    //处理逻辑：
    //    如果标记全部按钮已选，则所有都完成
    //    如果未选，则所有的都未完成。
    toggleAllComplete: function () {
      var done = this.allCheckbox.checked;
      Todos.each(function (todo) { todo.save({'done': done}); });
    }

  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

});

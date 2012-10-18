
var AppView = Backbone.View.extend({
  el: $("body"),

  events: {
    "click #home_btn" : "showMain",
    "click #order_btn" : "showOrder",
    "click #menu_btn" : "showMenu",
    "click #account_btn" : "showAccount",
    "click #dashboard_btn" : "showDashboard",
    "click #order_btn_nav" : "showOrder"
  },

  initialize: function() {
    this.mcv = new MainContainerView();
    $(this.mcv.el).addClass("visible");
  },
                                     
  init: function() {
    this.ocv = new OrderContainerView();
    this.acv = new AccountContainerView();
    this.mecv = new MenuContainerView();
    this.dcv = new DashboardContainerView();
    $("#order_form").submit(function() {
      return false;
    });
    $(this.mcv.el).addClass("visible");
    $("#dashboard_btn").hide();
  },

  showMain: function() {
    !this.mcv || $(this.mcv.el).addClass("visible");
    !this.ocv || $(this.ocv.el).removeClass("visible");
    !this.acv || $(this.acv.el).removeClass("visible");
    !this.mecv || $(this.mecv.el).removeClass("visible");
    !this.dcv || $(this.dcv.el).removeClass("visible");
    $(".collapse").collapse('hide');
  },

  showOrder: function() {
    this.ocv.render();
    !this.ocv || $(this.ocv.el).addClass("visible");
    !this.acv || $(this.acv.el).removeClass("visible");
    !this.mcv || $(this.mcv.el).removeClass("visible");
    !this.mecv || $(this.mecv.el).removeClass("visible");
    !this.dcv || $(this.dcv.el).removeClass("visible");
    $(".collapse").collapse('hide');
  },

  showMenu: function() {
    !this.mecv || $(this.mecv.el).addClass("visible");
    !this.ocv || $(this.ocv.el).removeClass("visible");
    !this.acv || $(this.acv.el).removeClass("visible");
    !this.mcv || $(this.mcv.el).removeClass("visible");
    !this.dcv || $(this.dcv.el).removeClass("visible");
    $(".collapse").collapse('hide');
  },

  showAccount: function() {
    this.acv.render();
    !this.acv || $(this.acv.el).addClass("visible");
    !this.ocv || $(this.ocv.el).removeClass("visible");
    !this.mcv || $(this.mcv.el).removeClass("visible");
    !this.mecv || $(this.mecv.el).removeClass("visible");
    !this.dcv || $(this.dcv.el).removeClass("visible");
    $(".collapse").collapse('hide');
  },

  showDashboard: function() {
    this.dcv.render();
    !this.dcv || $(this.dcv.el).addClass("visible");
    !this.ocv || $(this.ocv.el).removeClass("visible");
    !this.mcv || $(this.mcv.el).removeClass("visible");
    !this.mecv || $(this.mecv.el).removeClass("visible");
    !this.acv || $(this.acv.el).removeClass("visible");
    $(".collapse").collapse('hide');
  },
                                     
  enableDashboard: function() {
    $("#dashboard_btn").show();
  },
                                     
  opts: {
    lines: 13, // The number of lines to draw
    length: 7, // The length of each line
    width: 4, // The line thickness
    radius: 10, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    color: '#000', // #rgb or #rrggbb
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
  },
  
  spinner: null,
  
  enable: function() {
    this.init();
    this.spinner.stop();
    $("#run_status").html("<h3>Dan is making a run today!</h3>");
    $("#run_status").css("color", "green");
    $("#order_btn_nav").show();
    $("#order_btn_nav").removeClass("invisible");
    $("#order_btn").show();
  },
  
  fullDisable: function() {
    this.acv = new AccountContainerView();
    this.mecv = new MenuContainerView();
    this.dcv = new DashboardContainerView();
    
    $("#order_btn_nav").hide();
    $("#order_btn").hide();
    
    var currentRun = function(data, textStatus, jqXHR) {
      if (data.run_id) {
        $("#run_status").html("<h3>To place an order, the Lando's app must be opened as an embedded experience</h3>");
        $("#run_status").css("color", "red");
        $("#current_run").html("<strong>" + data.run_id + "</strong>");
      } else {
        $("#run_status").html("<h3>Sorry! There is no run today.</h3>");
        $("#run_status").css("color", "red");
      }
    };
    io.makeRequest("/run/current", "GET,", "", currentRun);
    $("#order_btn_nav").hide();
    $("#order_btn").hide();
  },
  
  tempDisable: function() {
    this.spinner = new Spinner(this.opts).spin();
    $("#run_status").append(this.spinner.el);
    $(this.spinner.el).css("left", "180px");
    $(this.spinner.el).css("top", "20px");
    $("#order_btn_nav").hide();
    $("#order_btn").hide();
  }

});

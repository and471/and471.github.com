    
    var ANIMATION_DURATION = 400;
    
    var visible = true;
    var opengrok_url = "";
    var searchbox_height = 0;
    var resize_timeout = undefined;

    function preload(arrayOfImages) {
        $(arrayOfImages).each(function() {
            $('<img/>')[0].src = this;
        });
    }

    function on_window_resize() {
        if (resize_timeout != undefined) {
            clearTimeout(resize_timeout);
        }
        resize_timeout = setTimeout("resize_iframe(true)", 100);
    }
    
    function resize_iframe(animate) {
        var height_window = $("html").height() + 10;
        
        var height_remaining = height_window;
        if ($("#TopHeader").is(":visible")) {
            height_remaining -= $("#TopHeader").outerHeight(true);
        }
        if ($("#BottomHeader").is(":visible")) {
            height_remaining -= $("#BottomHeader").outerHeight(true);
        }
        if ($("#opengrok-searchbox").is(":visible")) {
            height_remaining -= $("#opengrok-searchbox").outerHeight(true);
        }
        
        if (animate == true) {
            $("#opengrok-frame").animate({height: height_remaining}, ANIMATION_DURATION);
            resize_timeout = undefined;
        } else {
            $("#opengrok-frame").css("height", height_remaining);
        }
    }
    
    function on_form_element_keydown(e) {
        if (e.which == 13) { // Enter key
            on_button_search_clicked();
        }
    }

    function on_button_search_clicked() {
        // Reset URL
        opengrok_url = "http://opengrok.libreoffice.org/search?remote=true";

        query_empty = true;

        // Get search queries
        $(".search-box:not(.fake) select option:selected").each(function(index) {
            var type = $(this).attr("id");
            var value = $(this).parent().siblings("input").attr("value");
            
            if (value != "") {
                query_empty = false;
            }
            
            opengrok_url += "&" + type + "=" + value;
        });
        
        if (query_empty == true) {
            return;
        }
        
        // Get the sort order
        var sort = $("#sort-select option:selected").attr("id");
        opengrok_url += "&sort=" + sort;
        
        // Set the search locations
        opengrok_url += "&project="
        $("#search-locations input[type=checkbox]:checked").each( function(index) {
            var location = $(this).attr("id");
            opengrok_url += location + ",";
        });
        
        // Go to URL
        $("#opengrok-frame").attr("src", opengrok_url);
        alert(opengrok_url);
    }

    function on_button_remove_clicked(search_box) {
        remove_searchbox(search_box);
    }

    function on_button_add_clicked() {
        add_searchbox(true, true);
    }
    
    function on_search_input() {
        if ($(this).attr("value") != "") {
            $(this).css("background-image", "url(clear.png)")
        } else {
            $(this).css("background-image", "none")
        }
    }

    function add_searchbox(with_remove_button, animate) {
        var search_box = $("<div/>").addClass("search-box");
        
        if (animate) {
            $(search_box).hide();
        }
        
        $("<select/>").addClass("search-type-selector")
                      .append("<option id='q'>Full Search</option>")
                      .append("<option id='defs'>Definition</option>")
                      .append("<option id='refs'>Symbol</option>")
                      .append("<option id='path'>File Path</option>")
                      .append("<option id='history'>Commit Log</option>")
                      .keydown(on_form_element_keydown)
                      .appendTo(search_box);
        
        $('<input/>').addClass("search-input")
                     .bind("input", on_search_input)
                     .keydown(on_form_element_keydown)
                     .click( function(e) {
                        if ($(this).attr("value") == "") {
                            return;
                        }
                        var offset = e.pageX - $(this).offset().left;
                     
                        if (($(this).outerWidth() - offset) < 22) {
                            $(this).attr("value", "");
                            $(this).css("background-image", "none")
                        }
                     })
                     .mousemove( function(e) {
                        if ($(this).attr("value") == "") {
                            return;
                        }
                        var offset = e.pageX - $(this).offset().left;
                     
                        if (($(this).outerWidth() - offset) < 22) {
                            $(this).css('cursor', 'pointer');
                        } else {
                            $(this).css('cursor', 'text');
                        }
                     })
                    .mouseleave( function() {
                        $(this).css('cursor','auto');
                     })
                     .appendTo(search_box);
                            
        if (with_remove_button) {
            $("<a href='#'></a>").append($("<div></div>"))
                                 .addClass("button-remove")
                                 .appendTo(search_box)
                                 .click(function(e) {
                                     on_button_remove_clicked(search_box);
                                     e.preventDefault();
                                 });
        }
        
        $(search_box).insertBefore(".search-box.fake");
        
        if (animate) {
            $(".search-box.fake").hide();
            $(search_box).show();
            $(".search-box.fake *[disabled]").css("opacity", 0);
            $(".search-box.fake").slideDown(ANIMATION_DURATION)
            $(".search-box.fake *[disabled]").animate({opacity:0.4}, {duration:ANIMATION_DURATION, queue:false});
        }
    }
    
    function remove_searchbox(search_box) {
        $(search_box).slideUp(ANIMATION_DURATION);
    
        $(search_box).animate({
            opacity: "0",
        }, { 
            duration: ANIMATION_DURATION,
            queue: false,
            complete: function() {
                $(search_box).remove();
            }
        });
    }
    
    function add_fake_searchbox() {
        var search_box = $("<div></div>").addClass("search-box fake");
        
        $("<select/>").addClass("search-type-selector")
                      .attr("disabled", "disabled")
                      .appendTo(search_box);
        
        $('<input/>').addClass("search-input")
                     .attr("disabled", "disabled")
                     .appendTo(search_box);
        
        $("<a href='#'/>").append($("<div></div>"))
                          .addClass("button-add")
                          .appendTo(search_box)
                          .click(function(e) {
                              on_button_add_clicked();
                              e.preventDefault();
                           })
                           .hover( function() {
                               $(".search-box.fake *[disabled]").stop();
                               $(".search-box.fake *[disabled]").animate({
                                   opacity:1
                               }, ANIMATION_DURATION);
                           }, function() {
                               $(".search-box.fake *[disabled]").stop();
                               $(".search-box.fake *[disabled]").animate({
                                   opacity:0.4
                               }, ANIMATION_DURATION);
                           });

        $('<div/>').addClass("clear")
                   .appendTo(search_box);
        
        $(search_box).appendTo("#search-inputs");
    }

    $(document).ready(function() {
        // Add the fake searchbox...
        add_fake_searchbox();
        // ...and a real one that cannot be removed
        add_searchbox(false);
        
        $("#button-search").click(function(e) {
            on_button_search_clicked();
            e.preventDefault();
        });
        
        $(".toggle-link").click(function(e) {
            if (visible == true) {
                searchbox_height = $("#opengrok-searchbox").height();
                $("#opengrok-searchbox").animate({height:0}, ANIMATION_DURATION, 
                function() {
                    resize_iframe(true)
                });
                $("#TopHeader").slideUp();
                $(".toggle-link span").text("Show Search Box")
                visible = false;
            } else {
                $("#opengrok-searchbox").animate({height:searchbox_height}, ANIMATION_DURATION, 
                function() {
                    $("#opengrok-searchbox").css("height", "auto");
                    resize_iframe(true);
                });
                $("#TopHeader").slideDown();
                $(".toggle-link span").text("Hide Search Box")
                visible = true;
            }
            on_window_resize();
            e.preventDefault();
        });
        
        $("#search-locations input[type=checkbox]").keydown(on_form_element_keydown);
        $("#sort-select").keydown(on_form_element_keydown);
        
        window.onresize = on_window_resize;
        resize_iframe();
        
        // Preload images
        preload(['clear.png', 'remove.png']);
    });

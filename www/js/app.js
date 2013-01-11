$(document).ready(function() {
	/* VARS */
	var active_slide = 0;
	var audio_length = 686; // TODO: Pass in dynamically somehow?
	var num_slides = 0;
	var slideshow_data = [];
    var chapters = [];
    var current_chapter = '';
	var pop; // Popcorn element
    var audio_supported = !($.browser.msie === true && $.browser.version < 9);
    var slide_list_open = false;

	/* ELEMENTS */
    var $main_content = $('#main-content');
	var $s = $('#slideshow');
	var $slide_wrap = $('#slideshow-wrap');
    var $slide_list = $('#list-nav');
    var $slide_list_end = $('#list-nav-end');
	var $slide_nav = $('#slide-nav');
    var $credits_nav = $('#credits-nav')
	var $next = $('#next-btn');
	var $back = $('#back-btn');
    var $audio_nav = $('#audio-navbar');
	var $audio_branding = $audio_nav.find('.branding');
    var $audio = $('#audio');
	var $progress = $audio.find('.jp-progress-container');
	var $player = $('#pop-audio');
	var $slide_browse_btn = $('#browse-btn');
	var $titlecard = $('#panel0');
	var $panels;
	var $panel_images;

    if (!audio_supported) {
        $audio.hide(); 
    }

    slide_list_toggle('close');
    
    if (audio_supported) {
        /* 
         * Load audio player
         */
        $player.jPlayer({
            ready: function () {
                $(this).jPlayer('setMedia', {
                    mp3: "http://apps.npr.org/sotomayor/narration.mp3",
                    oga: "http://apps.npr.org/sotomayor/narration.ogg"
                }).jPlayer("pause");

                load_slideshow_data();
            },
            ended: function (event) {
                $(this).jPlayer("pause", audio_length - 1);
            },
            swfPath: "js",
            supplied: "oga, mp3"
        });
        // associate jPlayer with Popcorn
        pop = Popcorn('#jp_audio_0');
    } else {
        load_slideshow_data();
    }

    function ap_date(mmnt) {
        /*
         * Hacky AP date-formatter for moment().
         */
        var out = mmnt.format('MMM');

        if (mmnt.month() == 4) {
            // May
        } else if (mmnt.month() == 5) {
            out = 'June';
        } else if (mmnt.month() == 6) {
            out = 'July';
        } else if (mmnt.month() == 8) {
            out = 'Sept.';
        } else {
            out += '.';
        }

        out += ' ' + mmnt.format('D, YYYY');

        return out;
    }

    function goto_slide(id) {
    	/*
    	 * Determine whether to shift to the next slide
    	 * with audio, or without audio.
    	 */
    	active_slide = parseInt(id);

        if (!audio_supported || $player.data().jPlayer.status.paused || slideshow_data[id] == undefined) {
            scroll_to_slide(id);
            
            if (slideshow_data[id] != undefined) {
				$player.jPlayer('pause', slideshow_data[id]['cue']);
            }
        } else if (id == (num_slides - 1)) {
            scroll_to_slide(id);

            $player.jPlayer('pause', audio_length - 1);
        } else {
            play_slide(id);
        }

        return false; 
    }

    function scroll_to_slide(id) {
        /*
         * Scroll horizontally to the correct slide position.
         */
        $.smoothScroll({
            direction: 'left',
            scrollElement: $s,
            scrollTarget: '#panel' + id
        });
        active_slide = id;
        
        //show chapter title in nav
        if(slideshow_data[id]) {
            current_chapter = slideshow_data[id]['chapter'];
            $("#chapter-title").text(current_chapter);
        }

		swap_slide_bg();

        return false;
    }

    function play_slide(id) {
        /*
         * Play a slide at the correct audio cue.
         */
        if (audio_supported) {
            $player.jPlayer('play', slideshow_data[id]['cue']);
        } else {
            scroll_to_slide(id);
        } 
    }
    
    function swap_slide_bg() {
        if ($main_content.width() <= 480) {
            image_width = 480;
        } else if ($main_content.width() <= 979) {
            image_width = 979;
        } else {
            image_width = 1200;
        }

    	if (active_slide == 0) {
            image_name = 'start';
		} else if (active_slide >= 1 && active_slide < 15) {
            image_name = 'chapter1';
		} else if (active_slide >= 15 && active_slide < 21) {
            image_name = 'chapter2';
		} else if (active_slide >= 21 && active_slide < 34) {
            image_name = 'chapter3';
		} else if (active_slide >= 34 && active_slide < 42) {
            image_name = 'chapter4';
		} else if (active_slide >= 42 && active_slide < 46) {
            image_name = 'chapter5';
		} else if (active_slide >= 46 && active_slide < 53) {
            image_name = 'chapter6';
		} else if (active_slide >= 53 && active_slide < 61) {
            image_name = 'chapter7';
		} else if (active_slide >= 61) {
            image_name = 'chapter7';
    	}

        if ($s.css('background-image').indexOf(image_name) == -1) {
            $s.css('background-image', 'url(img/art/' + image_name + '_'  + image_width + '.jpg)');
        }
    }

	function load_slideshow_data() {
        /* 
         * Load slideshow data from external JSON
         */
		var slide_output = '';
		var audio_output = '';
        var browse_output = '';
        var endlist_output = '';
        var last_chapter = null;
        var chapters = [];
		
		$.getJSON('slides.json', function(data) {
			slideshow_data.push(undefined);
            
            //calculate chapter widths
            $.each(data, function(k,v) {
                var context = v;
                var chapter = {};
                chapter['id'] = k + 1;
                if (last_chapter != null) {
                    if (context['chapter'] != last_chapter['name']) {
                        chapter['name'] = context['chapter'];
                        chapter['start'] = context['cue'];
                        chapter['photo1_name'] = context['photo1_name'];
                        //write down previous chapter length
                        last_chapter['length'] = chapter['start'] - last_chapter['start'];
                        //this chapter is now the last chapter
                        last_chapter = chapter;
                        chapters.push(chapter);
                    }
                } else {
                    //first chapter
                    chapter['name'] = context['chapter'];
                    chapter['start'] = 0;
                    chapter['photo1_name'] = context['photo1_name'];
                    last_chapter = chapter;
                    chapters.push(chapter);
                }
            });
            //set very last chapter width
            chapters[chapters.length - 1]['length'] = audio_length - chapters[chapters.length - 1]['start'];
            //Render chapter nav
            $.each(chapters, function(k,v) {
                var chapter = v;
                chapter['width'] = 100 * parseFloat(chapter['length']) / audio_length;
                browse_output += JST.browse(chapter);
                audio_output += JST.slidenav(chapter);
                endlist_output += JST.endlist(chapter);           
                
            });
            
            
			$.each(data, function(k, v) {
				slideshow_data.push(v);
			
				// Markup for this slide and its entry in the slide nav
				// via Underscore template / JST
                var context = v;
                context['id'] = k + 1;

                if ($main_content.width() <= 480) {
                    context['image_width'] = 480;
                } else if ($main_content.width() <= 979) {
                    context['image_width'] = 979;
                } else {
                    context['image_width'] = 1200;
                }

                slide_output += JST.slide(context);

				num_slides++;
				
                if (audio_supported) {
                	var cue = v["cue"];

                	if (k == 0) {
                		cue += 1;
                	}

                    // Popcorn cuepoint for this slide
                    pop.code({
                        start: cue,
                        end: cue + .5,
                        onStart: function(options) {         
                            scroll_to_slide(k + 1); 
                            return false;
                        }
                    });
                }
			});

            // Append credits to drop-down nav
            browse_output += JST.browse({
                'id': num_slides + 1,
                'name': 'Index & Credits'
            });

			$titlecard.after(slide_output);
			$slide_nav.append(audio_output);
			$slide_list.append(browse_output);
            $slide_list_end.append(endlist_output);
			
			num_slides += 2; // because we have both a title slide and a closing slide
			// rename the closing slides with the correct ID numbers
			var end_id = num_slides - 1;
			var end_cue = audio_length;
			$('#panelend').attr('id','panel' + end_id);
			slideshow_data.push({
				id: end_id,
				cue: end_cue,
                chapter: ''
			});
            
			if (audio_supported) {
				// Popcorn cuepoint for opening slide
				pop.code({
					start: 0,
					end: .5,
					onStart: function( options ) {         
						scroll_to_slide(0); 
						return false;
					}
				});
				// Popcorn cuepoint for closing slide
				pop.code({
					start: end_cue,
					end: end_cue + .5,
					onStart: function( options ) {         
						scroll_to_slide(end_id); 
						return false;
					}
				});
			}

			$slide_nav.find('.slide-nav-item').click( function() {
				var id = parseInt($(this).attr('data-id'));
                goto_slide(id);
			});
            
			$slide_nav.find('.slide-nav-item').hover(function() {
                $("#chapter-title").text(this.title);
			}, function(){
			    $("#chapter-title").text(current_chapter);
			});

            $slide_list.find('a').click(function() {
				var id = parseInt($(this).attr('data-id'));
                goto_slide(id);
                slide_list_toggle('close');
            });
            
            $credits_nav.click(function(){
               goto_slide(end_id); 
            });
	
	        $slide_list_end.find('a.slidelink').click(function() {
				var id = parseInt($(this).attr('data-id'));
                goto_slide(id);
            });
	
            $panels = $slide_wrap.find('.panel');
            $panel_images = $panels.find('.panel-bg');

            resize_slideshow();
            
//            scroll_to_slide(12);
		});
	}
	
	function resize_slideshow() {
        /* 
         * Resize slideshow panels based on screen width
         */
		var new_width = $main_content.width();
		var new_height = $(window).height() - $audio.height();
		var height_43 = Math.ceil(($main_content.width() * 3) / 4);

		if (new_width <= 480) {
			new_height = 600;
		} else if (new_height > height_43) { 
			// image ratio can go no larger than 4:3
			new_height = height_43;
		}

		$s.width(new_width + 'px').height(new_height + 'px');
		$slide_wrap.width((num_slides * new_width) + 'px').height(new_height + 'px');
		$panels.width(new_width + 'px').height(new_height + 'px');
		$titlecard.height(new_height + 'px');

		if (new_width <= 480) {
			$panel_images.height((Math.ceil(new_width * 9) / 16) + 'px');
		} else {
			$panel_images.height('100%');
		}

        if (new_width <= 767) {
            $('#next-btn').html('&gt;');
            $('#back-btn').html('&lt;');
        } else {
            $('#next-btn').html('Next&nbsp;&gt;');
            $('#back-btn').html('&lt;&nbsp;Back');
        }
        
		// reset navbar position
		var navpos = $audio_nav.position;
		$slide_list.css('top',navpos.top + $audio_nav.height());
		
		// reset slide position
		scroll_to_slide(active_slide);
	}
	$(window).resize(resize_slideshow);


	/* 
	 * Click actions
	 */
	$('#title-button').click(function() {
		play_slide(1);
	});
	
	function slide_list_toggle(mode) {
		if (slide_list_open || mode == 'close') {
			$slide_list.hide();
			$slide_browse_btn.removeClass('active');
			slide_list_open = false;
		} else if (!slide_list_open || mode == 'open') {
			$slide_list.show();
			$slide_browse_btn.addClass('active');
			slide_list_open = true;
		}
	}
	$slide_browse_btn.on('click', function(e){
		slide_list_toggle();
	});

	function goto_next_slide() {
		if (active_slide < (num_slides-1)) {
            var id = active_slide + 1;
            goto_slide(id);
		}
		return false;
	}
    $next.click(goto_next_slide);

	function goto_previous_slide() {
		if (active_slide > 0) {
            var id = active_slide - 1;
            goto_slide(id);
		}
		return false;
	}
	$back.click(goto_previous_slide);

    $(document).keydown(function(ev) {
        if (ev.which == 37) {
            goto_previous_slide();
            return false;
        } else if (ev.which == 39) {
            goto_next_slide();
            return false;
        } else if (ev.which == 32 && audio_supported) {
            if ($player.data().jPlayer.status.paused) {
                $player.jPlayer('play');
            } else {
                $player.jPlayer('pause');
            }
            return false;
        }

        return true;
    });
});

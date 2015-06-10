/*!
 * Lazy Load - jQuery plugin for lazy loading images
 * Copyright (c) 2007-2015 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/lazyload
 *
 * Version:  1.9.5
 *
 */
(function($, window, document, undefined) {
  'use strict';

  var $win     = $(window);
  var defaults = {
    threshold:    0,
    failureLimit: 0,
    event:        'scroll',
    effect:       'show',
    container:    window,
    dataAttr:     'original',
    ignore:       ':hidden',
    appear:       $.noop,
    load:         $.noop,
    error:        $.noop,
    placeholder:  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC'
  };


  /**
   *
   * @param element
   * @param options
   * @returns {boolean}
   */
  function isBelowFold(element, options) {
    var bottom;
    var win = window;

    options = $.extend(defaults, options);

    if ( options.container === undefined || options.container === win ) {
      bottom = (win.innerHeight ? win.innerHeight : $win.height()) + $win.scrollTop();
    } else {
      bottom = $(options.container).offset().top + $(options.container).height();
    }

    return bottom <= $(element).offset().top - options.threshold;
  }


  /**
   *
   * @param element
   * @param options
   * @returns {boolean}
   */
  function isRightOfScreen(element, options) {
    var fold;

    options = $.extend(defaults, options);

    if ( options.container === undefined || options.container === window ) {
      fold = $win.width() + $win.scrollLeft();
    } else {
      fold = $(options.container).offset().left + $(options.container).width();
    }

    return fold <= $(element).offset().left - options.threshold;
  }


  /**
   *
   * @param element
   * @param options
   * @returns {boolean}
   */
  function isAboveTop(element, options) {
    var top;

    options = $.extend(defaults, options);

    if ( options.container === undefined || options.container === window ) {
      top = $win.scrollTop();
    } else {
      top = $(options.container).offset().top;
    }

    return top >= $(element).offset().top + options.threshold + $(element).height();
  }


  /**
   *
   * @param element
   * @param options
   * @returns {boolean}
   */
  function isLeftOfScreen(element, options) {
    var fold;

    options = $.extend(defaults, options);

    if ( options.container === undefined || options.container === window ) {
      fold = $win.scrollLeft();
    } else {
      fold = $(options.container).offset().left;
    }

    return fold >= $(element).offset().left + options.threshold + $(element).width();
  }


  /**
   *
   * @param element
   * @param options
   * @returns {boolean}
   */
  function isInViewport(element, options) {
    return !isRightOfScreen(element, options) && !isLeftOfScreen(element, options) && !isBelowFold(element, options) && !isAboveTop(element, options);
  }

  //
  $.fn.lazyload = function(options) {
    var elements = this;
    var $container;

    options = $.extend(defaults, options);

    /**
     *
     */
    function update() {
      var counter = 0;

      elements.each(function() {
        var $this = $(this);
        if ( $this.is(options.ignore) ) {
          return;
        }

        if ( isAboveTop(this, options) || isLeftOfScreen(this, options) ) {
          /* Nothing. */
        } else if ( !isBelowFold(this, options) && !isRightOfScreen(this, options) ) {
          $this.trigger('appear');
          // if we found an image we'll load, reset the counter
          counter = 0;
        } else {
          if ( ++counter > options.failureLimit ) {
            return false;
          }
        }
      });
    }

    // Cache container as jQuery as object.
    $container = (options.container === undefined ||
    options.container === window) ? $win : $(options.container);

    // Fire one scroll event per scroll. Not one scroll event per image.
    if ( 0 === options.event.indexOf('scroll') ) {
      $container.bind(options.event, function() {
        return update();
      });
    }

    this.each(function() {
      var self  = this;
      var $self = $(self);

      self.loaded = false;

      //If no src attribute given use data:uri.
      if ( $self.attr('src') === undefined || $self.attr('src') === false ) {
        if ( $self.is('img') ) {
          $self.attr('src', options.placeholder);
        }
      }

      /* When appear is triggered load original image. */
      $self.one('appear', function() {
        if ( !this.loaded ) {

          var remaining = elements.length;

          // call appear callback
          options.appear.call(self, remaining, options);

          $(document.createElement('img'))
            // load handler
            .on('load', function() {

              var original = $self.attr('data-' + options.dataAttr);
              $self.hide();

              if ( $self.is('img') ) {
                $self.attr('src', original);
              } else {
                $self.css('background-image', 'url("' + original + '")');
              }
              $self[options.effect](options.effect_speed);

              self.loaded = true;

              /* Remove image from array so it is not looped next time. */
              var temp = $.grep(elements, function(element) {
                return !element.loaded;
              });
              elements = $(temp);

              var elements_left = elements.length;
              options.load.call(self, elements_left, options);
            })
            // error handler
            .on('error', function() {
              self.loaded = true;

              /* Remove image from array so it is not looped next time. */
              var temp = $.grep(elements, function(element) {
                return !element.loaded;
              });
              elements = $(temp);

              var elements_left = elements.length;
              options.error.call(self, elements_left, options);

            })
            .attr('src', $self.attr('data-' + options.dataAttr));
        }
      });

      /* When wanted event is triggered load original image */
      /* by triggering appear.                              */
      if ( 0 !== options.event.indexOf('scroll') ) {
        $self.on(options.event, function() {
          if ( !self.loaded ) {
            $self.trigger('appear');
          }
        });
      }
    });

    //Check if something appears when window is resized.
    $win.on('resize', function() {
      update();
    });

    //With IOS5 force loading images when navigating with back button.
    //Non optimal workaround.
    if ( (/(?:iphone|ipod|ipad).*os 5/gi).test(navigator.appVersion) ) {
      $win.on('pageshow', function(event) {
        if ( event.originalEvent && event.originalEvent.persisted ) {
          elements.each(function() {
            $(this).trigger('appear');
          });
        }
      });
    }

    //Force initial check if images should appear.
    $(function() {
      update();
    });

    return this;
  };

  // default options
  $.fn.lazyload.defaults = defaults;


  /* Custom selectors for your convenience.   */
  /* Use as $('img:below-the-fold').something() or */
  /* $('img').filter(':below-the-fold').something() which is faster */

  $.extend($.expr[':'], {
    'below-the-fold':  function(a) { return isBelowFold(a, { threshold: 0 }); },
    'above-the-top':   function(a) { return !isBelowFold(a, { threshold: 0 }); },
    'right-of-screen': function(a) { return isRightOfScreen(a, { threshold: 0 }); },
    'left-of-screen':  function(a) { return !isRightOfScreen(a, { threshold: 0 }); },
    'in-viewport':     function(a) { return isInViewport(a, { threshold: 0 }); }
  });

})(jQuery, window, document);

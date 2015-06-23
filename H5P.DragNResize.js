H5P.DragNResize = (function ($) {

  /**
   * Constructor!
   *
   * @class H5P.DragNResize
   * @param {H5P.jQuery} $container
   */
  function C($container) {
    var self = this;
    this.$container = $container;

    // Override settings for snapping to grid, and locking aspect ratio.
    H5P.$body.keydown(function (event) {
      if (event.keyCode === 17) {
        // Ctrl
        self.revertSnap = true;
      }
      else if (event.keyCode === 16) {
        // Shift
        self.revertLock = true;
      }
    }).keyup(function (event) {
      if (event.keyCode === 17) {
        // Ctrl
        self.revertSnap = false;
      }
      else if (event.keyCode === 16) {
        // Shift
        self.revertLock = false;
      }
    });
  }

  /**
   * Gives the given element a resize handle.
   *
   * @param {H5P.jQuery} $element
   */
  C.prototype.add = function ($element) {
    var that = this;

    $('<div class="h5p-dragnresize-handle"></div>').appendTo($element).mousedown(function (event) {
      that.$element = $element;
      that.press(event.clientX, event.clientY);

      return false;
    });
  };

  /**
   * Start resizing
   *
   * @param {number} x
   * @param {number} y
   */
  C.prototype.press = function (x, y) {
    var eventData = {
      instance: this
    };

    H5P.$body.bind('mouseup', eventData, C.release)
    .bind('mouseleave', eventData, C.release)
    .css({
      '-moz-user-select': 'none',
      '-webkit-user-select': 'none',
      'user-select': 'none',
      '-ms-user-select': 'none'
    })
    .mousemove(eventData, C.move)
    .attr('unselectable', 'on')[0]
    .onselectstart = H5P.$body[0].ondragstart = function () {
      return false;
    };

    this.startX = x;
    this.startY = y;
    this.startWidth = this.$element.width() + pxToNum(this.$element.css('paddingLeft')) + pxToNum(this.$element.css('paddingRight'));
    this.startHeight = this.$element.height() + pxToNum(this.$element.css('paddingTop')) + pxToNum(this.$element.css('paddingBottom'));
    this.ratio = (this.startWidth / this.startHeight);
    this.left = pxToNum(this.$element.css('left'));
    this.top = pxToNum(this.$element.css('top'));

    this.containerEm = pxToNum(this.$element.css('fontSize'));
    this.containerWidth = this.$container.width();
    this.containerHeight = this.$container.height();
  };

  /**
   * Resize events
   *
   * @param {Event} event
   */
  C.move = function (event) {
    var that = event.data.instance;

    that.newWidth = that.startWidth + event.clientX - that.startX;
    that.newHeight = that.startHeight + event.clientY - that.startY;

    if (that.snap && !that.revertSnap) {
      that.newWidth = Math.round(that.newWidth / that.snap) * that.snap;
      that.newHeight = Math.round(that.newHeight / that.snap) * that.snap;
    }

    if (that.lock && !that.revertLock) {
      // Make sure ratio is the same
      var newRatio = (that.newWidth / that.newHeight);
      if (that.ratio < newRatio) {
        that.newHeight = that.newWidth / that.ratio;
      }
      else if (that.ratio > newRatio) {
        that.newWidth = that.newHeight * that.ratio;
      }
    }

    if (that.newWidth < that.containerEm) {
      // Make sure our width is not to small.
      that.newWidth = that.containerEm;
    }
    else if (that.newWidth + that.left > that.containerWidth) {
      // Make sure we're not outside the container.
      that.newWidth = that.containerWidth - that.left;
      if (that.lock && !that.revertLock) {
        that.newHeight = that.newWidth / that.ratio;
      }
    }

    if (that.newHeight < that.containerEm) {
      // Make sure height is not to small.
      that.newHeight = that.containerEm;
    }
    else if (that.newHeight + that.top > that.containerHeight) {
      // Make sure we're not outside the container.
      that.newHeight = that.containerHeight - that.top;
      if (that.lock && !that.revertLock) {
        that.newWidth = that.newHeight * that.ratio;
      }
    }

    // Convert to em
    that.newWidth = that.newWidth / that.containerEm;
    that.newHeight = that.newHeight / that.containerEm;

    that.$element.css({
      width: that.newWidth + 'em',
      height: that.newHeight + 'em'
    });
  };

  /**
   * Stop resizing
   *
   * @param {Event} event
   */
  C.release = function (event) {
    var that = event.data.instance;

    H5P.$body.unbind('mousemove', C.move)
    .unbind('mouseup', C.release)
    .unbind('mouseleave', C.release)
    .css({
      '-moz-user-select': '',
      '-webkit-user-select': '',
      'user-select': '',
      '-ms-user-select': ''
    })
    .removeAttr('unselectable')[0]
    .onselectstart = H5P.$body[0].ondragstart = null;

    if (that.resizeCallback !== undefined) {
      that.resizeCallback(that.newWidth, that.newHeight);
    }
  };

  /**
   * Convert px value to number.
   *
   * @param {string} px
   * @returns {Number}
   */
  var pxToNum = function (px) {
    return Number(px.replace('px', ''));
  };

  return C;
})(H5P.jQuery);

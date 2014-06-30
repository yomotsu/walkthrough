/*!
 * @author yomotsu http://yomotsu.net/
 * MIT License
 */


virtualInput = {};

( function () {

  var _ua = ( function () {
    return {
      Touch: typeof document.ontouchstart != "undefined",
      Pointer: window.navigator.pointerEnabled,
      MSPoniter: window.navigator.msPointerEnabled
    }
  } )();

  virtualInput._start = _ua.Pointer ? 'pointerdown' : _ua.MSPointer ? 'MSPointerDown' : _ua.Touch ? 'touchstart' : 'mousedown';
  virtualInput._move  = _ua.Pointer ? 'pointermove' : _ua.MSPointer ? 'MSPointerMove' : _ua.Touch ? 'touchmove' : 'mousemove';
  virtualInput._end   = _ua.Pointer ? 'pointerup' : _ua.MSPointer ? 'MSPointerUp' : _ua.Touch ? 'touchend' : 'mouseup';

} )();

virtualInput.Joystick = function ( $container, size, params ) {

  THREE.EventDispatcher.prototype.apply( this );

  this.angle = 0;
  this.position = { x: 0, y: 0 };
  this.isActive = false;

  this.width = size * 2;
  this.halfWidth = size;

  var that = this;
  var template = [
    '<div class="gameinput-joystick">',
      '<div class="gameinput-joystick__button"></div>',
      '<svg class="gameinput-frame" width="' + this.width + '" height="' + this.width + '">',
        '<circle cx="' + size + '" cy="' + size + '" r="' + ( size / 2 ) + '" fill="none" stroke="#fff" stroke-width="10"></circle>',
      '</svg>',
    '</div>'
  ].join( '' );

  var $win = $( window );
  this.$all = $( template );
  this.$button = this.$all.find( '.gameinput-joystick__button' );
  $container.append( this.$all );

  this.$all.css( {
    width:  this.width,
    height: this.width,
    left   : params && params.left   !== undefined ? params.left   : 'auto',
    right  : params && params.right  !== undefined ? params.right  : 'auto',
    top    : params && params.top    !== undefined ? params.top    : 'auto',
    bottom : params && params.bottom !== undefined ? params.bottom : 'auto'
  } );

  this.$button.css( {
    width:  size * .6,
    height: size * .6
  } );

  this.offset = this.$all.offset();
  this.buttonRadius = this.$button.width() / 2;
  this.frameRadius = size / 2;
  // this.position = { x: 0, y: 0 };

  var buttondown = function ( e ) {

    e.preventDefault();
    e.stopPropagation();
    that.dispatchEvent( { type: 'active' } );
    that.isActive = true;
    $win.on( virtualInput._move, mousemove );
    var x = (   ( e.clientX - that.offset.left ) - that.halfWidth ) / that.halfWidth * 2;
    var y = ( - ( e.clientY - that.offset.top  ) + that.halfWidth ) / that.halfWidth * 2;

  };

  var mousemove = function ( e ) {

    e.preventDefault();
    e.stopPropagation();
    var x = (   ( e.clientX - that.offset.left ) - that.halfWidth ) / that.halfWidth * 2;
    var y = ( - ( e.clientY - that.offset.top  ) + that.halfWidth ) / that.halfWidth * 2;
    that.setPosition( x, y );

  };

  var mouseup = function ( e ) {

    e.stopPropagation();
    that.dispatchEvent( { type: 'disactive' } );
    that.isActive = false;
    that.setPosition( 0, 0 );
    $win.off( virtualInput._move, mousemove );

  }

  this.setCSSPosition( 0, 0 );
  this.$all.on( virtualInput._start, buttondown );
  $win.on( virtualInput._end, mouseup );
  $win.on( 'resize', function () {
    that.offset = that.$all.offset();
  } );

};

virtualInput.Joystick.prototype.getLength = function ( x, y ) {

  return Math.sqrt( Math.pow( x, 2 ) + Math.pow( y, 2 ) );

};

virtualInput.Joystick.prototype.getAngle = function ( lengthX, lengthY ) {

  if ( lengthX === 0 && lengthY === 0 ) {

    return this.angle;

  }

  var angle = Math.atan( lengthY / lengthX );

  if ( 0 > lengthX && 0 <= lengthY ) {
    //the second quadrant
    angle += Math.PI;

  } else if ( 0 > lengthX && 0 > lengthY ) {
    //the third quadrant
    angle += Math.PI;

  } else if ( 0 <= lengthX && 0 > lengthY ) {
    //the fourth quadrant
    angle += Math.PI * 2;

  }

  this.angle = angle;
  return angle;

};

virtualInput.Joystick.prototype.getPointOnRadius = function ( angle ) {

  return {
    x: Math.cos( angle ),
    y: Math.sin( angle )
  };

};

virtualInput.Joystick.prototype.setPosition = function ( x, y ) {

  this.position.x = x;
  this.position.y = y;
  var length = this.getLength( x, y );
  var angle = this.getAngle( x, y );

  if ( 1 >= length ) {

    this.setCSSPosition( x, y );
    return;

  }

  var pointOnRadius = this.getPointOnRadius( angle );
  this.setCSSPosition( pointOnRadius.x, pointOnRadius.y );

}

virtualInput.Joystick.prototype.setCSSPosition = function ( x, y ) {

  this.$button.css( {
    left: ( this.halfWidth + x * this.frameRadius - this.buttonRadius ),
    top:  ( this.halfWidth - y * this.frameRadius - this.buttonRadius )
  } );

};





virtualInput.Button = function ( $container, size, params ) {

  THREE.EventDispatcher.prototype.apply( this );

  var that = this;
  var label = params.label;
  var template = [
    '<div class="gameinput-button">',
      '<div class="gameinput-button__inner">',
        label,
      '</div>',
    '</div>'
  ].join( '' );
  var $button = $( template );
  $container.append( $button );
  $button.css( {
    width: size,
    height: size,
    right: params.right,
    bottom: params.bottom,
  } );

  $button.on( virtualInput._start, function () {

    that.dispatchEvent( { type: 'press' } );

  } );
  
};



// virtualInput.SquareButton = function ( $container, width, height, params ) {

//   THREE.EventDispatcher.prototype.apply( this );

//   this.isHeld = false;
//   var that = this;
//   var label = params.label;
//   var template = [
//     '<div class="gameinput-squareButton">',
//       '<div class="gameinput-squareButton__inner">',
//         label,
//       '</div>',
//     '</div>'
//   ].join( '' );
//   var $button = $( template );
//   $container.append( $button );
//   $button.css( {
//     width: width,
//     height: height,
//     right: params.right,
//     bottom: params.bottom,
//   } );

//   $button.on( virtualInput._start, function () {

//     that.isHeld = true;
//     that.dispatchEvent( { type: 'press' } );

//   } );

//   $button.on( 'mouseleave', function () {

//     that.isHeld = false;

//   } );

//   $button.on( virtualInput._end, function () {

//     that.isHeld = false;

//   } );
  
// };

angular.module('hexApp', [])
  .controller('MainCtrl', [function() {
    var self = this;
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var layout;
    self.mouse =  "";
    self.format = 0;

    var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
    };

    if( isMobile.any() ) {
      self.size = 20;
    } else{
      self.size = 50;
    }

    self.option = "flat";
    self.radius = 2;

    self.modelOptions ={
      updateOn: 'default blur',
      debounce:{
        default: 1000,
        blur: 0
      },
      getterSetter: true,
      allowInvalid: true
    };

    self.resize = function(){
      ctx.canvas.width = Math.abs(self.size*2*3/4*(2*self.radius+3.5));
      ctx.canvas.height = Math.abs(self.size*2*3/4*(2*self.radius+3.5));
      self.center = Point(ctx.canvas.width/2, ctx.canvas.width/2);
    };

    self.clear = function(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    self.init = function(){
      self.resize();
      self.draw();
    };

    self.change = function(){
      self.resize();
      self.clear();
      self.draw();
    };

    self.draw = function() {
        console.log("ran");
        for (i = -self.radius; i <= self.radius; i++) {
          for (j = -self.radius; j <= self.radius; j++) {
            for (k = -self.radius; k <= self.radius; k++) {
              if (i+j+k == 0){
                //keep if else in tact below to keep colored hexes
                if (self.mouse.q ==i && self.mouse.r ==j && self.mouse.s ==k){
                  draw_hex(ctx, i, j, k, self.center, self.size,"#8ED6FF");
                }
                else{
                    draw_hex(ctx, i, j, k, self.center, self.size,"#ffffff");
                }
              }
            }
          }
        }
    };

    function draw_hex(canvas, q, r, s, center, size,color) {
      var h = Hex(q, r, s);
      if (self.option == "flat"){
        layout = Layout(layout_flat, Point(size, size), Point(center.x, center.y));
      }
      else{
        layout = Layout(layout_pointy, Point(size, size), Point(center.x, center.y));
      }
      var corners = polygon_corners(layout, h);
      canvas.beginPath();
      var item;
      for (item in corners) {
        if (item == 0) {
          canvas.moveTo(corners[item].x, corners[item].y);
        } else {
          canvas.lineTo(corners[item].x, corners[item].y);
        }
      }
      canvas.closePath();
      canvas.lineWidth = 3;
      canvas.stroke();
      canvas.fillStyle = color;
      canvas.fill();
    }

    function hex_corner_offset(layout, corner) {
      var M = layout.orientation;
      var size = layout.size;
      var angle = 2.0 * Math.PI * (M.start_angle - corner) / 6;
      return Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
    }

    function polygon_corners(layout, h) {
      var corners = [];
      var center = hex_to_pixel(layout, h);
      for (var i = 0; i < 6; i++) {
        var offset = hex_corner_offset(layout, i);
        corners.push(Point(center.x + offset.x, center.y + offset.y));
      }
      return corners;
    }

    function hex_round(h)
    {
    var q = Math.trunc(Math.round(h.q));
    var r = Math.trunc(Math.round(h.r));
    var s = Math.trunc(Math.round(h.s));
    var q_diff = Math.abs(q - h.q);
    var r_diff = Math.abs(r - h.r);
    var s_diff = Math.abs(s - h.s);
    if (q_diff > r_diff && q_diff > s_diff)
    {
        q = -r - s;
    }
    else
        if (r_diff > s_diff)
        {
            r = -q - s;
        }
        else
        {
            s = -q - r;
        }
    return Hex(q, r, s);
    }

    function hex_to_pixel(layout, h) {
      var M = layout.orientation;
      var size = layout.size;
      var origin = layout.origin;
      var x = (M.f0 * h.q + M.f1 * h.r) * size.x;
      var y = (M.f2 * h.q + M.f3 * h.r) * size.y;
      return Point(x + origin.x, y + origin.y);
    }

    function pixel_to_hex(layout, p) {
      var M = layout.orientation;
      var size = layout.size;
      var origin = layout.origin;
      var pt = Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
      var q = M.b0 * pt.x + M.b1 * pt.y;
      var r = M.b2 * pt.x + M.b3 * pt.y;
      return Hex(q, r, -q - r);
    }

    self.doClick = function(event){
    var offsetX = event.offsetX;
    var offsetY = event.offsetY;
    var x = self.center.x - offsetX;
    var y = self.center.y - offsetY;
    var res = pixel_to_hex(layout,Point(offsetX,offsetY));
    var mouse_check = hex_round(res);
    var p = ctx.getImageData(offsetX, offsetY, 1, 1).data;
    if (hex_distance(mouse_check,Hex(0,0,0)) < self.radius+1){
      if (self.format == 0){
        if (hex_distance(Hex(self.mouse.q,self.mouse.r,self.mouse.s),Hex(0,0,0)) < self.radius+1){
          draw_hex(ctx, self.mouse.q, self.mouse.r, self.mouse.s, self.center, self.size,"#ffffff");
        }
      }
      self.mouse = hex_round(res);
      draw_hex(ctx, self.mouse.q, self.mouse.r, self.mouse.s, self.center, self.size,'#8ED6FF');
      // console.log(event, offsetX, offsetY,self.mouse, hex_distance(self.mouse,Hex(0,0,0)));
    }


    };

    function hex_subtract(a, b)
    {
        return Hex(a.q - b.q, a.r - b.r, a.s - b.s);
    }

    function hex_length(hex)
    {
        return Math.trunc((Math.abs(hex.q) + Math.abs(hex.r) + Math.abs(hex.s)) / 2);
    }

    function hex_distance(a, b)
    {
        return hex_length(hex_subtract(a, b));
    }

    function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    //named functions
    function Point(x, y) {
      return {
        x: x,
        y: y
      };
    }

    function Hex(q, r, s) {
      return {
        q: q,
        r: r,
        s: s
      };
    }

    function Orientation(f0, f1, f2, f3, b0, b1, b2, b3, start_angle) {
      return {
        f0: f0,
        f1: f1,
        f2: f2,
        f3: f3,
        b0: b0,
        b1: b1,
        b2: b2,
        b3: b3,
        start_angle: start_angle
      };
    }

    function Layout(orientation, size, origin) {
      return {
        orientation: orientation,
        size: size,
        origin: origin
      };
    }

    var layout_pointy = Orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);
    var layout_flat = Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);

  }])
  .directive('convertToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(val) {
        return val != null ? parseInt(val, 10) : null;
      });
      ngModel.$formatters.push(function(val) {
        return val != null ? '' + val : null;
      });
    }
  };
});

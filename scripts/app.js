angular.module('hexApp', [])
  .controller('MainCtrl', [function() {
    var self = this;
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    self.option = "flat";
    self.center = Point(250, 250);
    self.size = 50;
    self.radius = 1;

    self.modelOptions ={
      updateOn: 'default blur',
      debounce:{
        default: 1000,
        blur: 0
      },
      getterSetter: true,
      allowInvalid: true
    };

    self.clear = function(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    self.draw = function() {

        for (i = -self.radius; i <= self.radius; i++) {
          for (j = -self.radius; j <= self.radius; j++) {
            for (k = -self.radius; k <= self.radius; k++) {
              if (i+j+k == 0){
                self.draw_hex(ctx, i, j, k, self.center, self.size);
              }
            }
          }


      }
    };

    self.draw_hex = function(canvas, q, r, s, center, size) {
      var h = Hex(q, r, s);
      var layout;
      if (self.option == "flat"){
        layout = Layout(layout_flat, Point(size, size), Point(center.x, center.y));
      }
      else{
        layout = Layout(layout_pointy, Point(size, size), Point(center.x, center.y));
      }
      var corners = self.polygon_corners(layout, h);
      canvas.beginPath();
      var item;
      for (item in corners) {
        if (item == 0) {
          canvas.moveTo(corners[item].x, corners[item].y);
        } else {
          canvas.lineTo(corners[item].x, corners[item].y);
        }
      }
      canvas.lineTo(corners[0].x, corners[0].y);
      canvas.stroke();
    };

    self.hex_corner_offset = function(layout, corner) {
      var M = layout.orientation;
      var size = layout.size;
      var angle = 2.0 * Math.PI * (M.start_angle - corner) / 6;
      return Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
    };

    self.polygon_corners = function(layout, h) {
      var corners = [];
      var center = self.hex_to_pixel(layout, h);
      for (var i = 0; i < 6; i++) {
        var offset = self.hex_corner_offset(layout, i);
        corners.push(Point(center.x + offset.x, center.y + offset.y));
      }
      return corners;
    };

    self.hex_to_pixel = function(layout, h) {
      var M = layout.orientation;
      var size = layout.size;
      var origin = layout.origin;
      var x = (M.f0 * h.q + M.f1 * h.r) * size.x;
      var y = (M.f2 * h.q + M.f3 * h.r) * size.y;
      return Point(x + origin.x, y + origin.y);
    };

    self.pixel_to_hex = function(layout, p) {
      var M = layout.orientation;
      var size = layout.size;
      var origin = layout.origin;
      var pt = Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
      var q = M.b0 * pt.x + M.b1 * pt.y;
      var r = M.b2 * pt.x + M.b3 * pt.y;
      return Hex(q, r, -q - r);
    };

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

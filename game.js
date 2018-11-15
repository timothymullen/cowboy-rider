let cowboy;
/* how appropriate */

let road;
let context_switcher;

function preload() {
  cowboy = new Cowboy();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  road = new Path();
  context_switcher = new ContextSwitcher();
}

function draw() {
  background('#619f3f')
  noFill();
  road.draw()
}

class ContextSwitcher {
  constructor() {
    this.state = 'start';
  }
}

class PathSegment {
  constructor(min, max, unit) {
    /*
    Pretty much just a wrapper for a Bezier curve.
    */
    const start_coord = min * unit;
    const end_coord   = max * unit;
    const controls = [start_coord + Math.random() * unit,
      start_coord + Math.random() * unit,
      start_coord + Math.random() * unit,
      start_coord + Math.random() * unit
    ]

    //const bez = new Bezier(start_coord, start_coord, controls[0], controls[1], controls[2], controls[3], end_coord, end_coord);
    this.x1 = start_coord;
    this.y1 = start_coord;
    this.x2 = controls[0];
    this.y2 = controls[1];
    this.x3 = controls[2];
    this.y3 = controls[3];
    this.x4 = end_coord;
    this.y4 = end_coord;
  }

  draw() {
    strokeWeight(10);
    stroke('#794446');
    bezier(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3, this.x4, this.y4)
  }

  follow(t) {
    const x = bezierPoint(this.x1, this.x2, this.x3, this.x4, t);
    const y = bezierPoint(this.y1, this.y2, this.y3, this.y4, t);
    strokeWeight(1);
    stroke(255, 102, 0);
    cowboy.blit(x, y);
  }
}

class Map {
  constructor(width, height) {
    const map = [[]];
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
      }
    }
  }
}

class Path {
  constructor() {
    this.unit = 100;
    this.num_curves = 6;
    this.num_segments = 30;
    this.curves = [];

    for (let i=0; i<this.num_curves; i++) {
      const new_curve = new PathSegment(i, i+1, this.unit);
      //const bez = new Bez((i+1) * unit, (i + 2) * unit)
      this.curves.push(new_curve);
    }
  }

  draw() {
    for (let a_curve of this.curves) {
      a_curve.draw();
      /*
      stroke('#000');
      ellipse(a_curve.x1, a_curve.y1, 5, 5);
      ellipse(a_curve.x4, a_curve.y4, 5, 5);
      stroke('#fff');
      ellipse(a_curve.x2, a_curve.y2, 5, 5);
      ellipse(a_curve.x3, a_curve.y3, 5, 5);
      */
    }


    /* now blit the cowboy */
    const divisor        = this.num_curves * this.num_segments;

    const frame_counter  = Math.floor(frameCount / 1.6)
    const position       = frame_counter % divisor;
    const position_index = position % this.num_segments;
    const curve_index    = Math.floor(position / this.num_segments);

    //console.table(divisor, position, curve_index, position_index);
    this.curves[curve_index].follow(position_index / this.num_segments);

    /*
    for (a_curve of curves) {
    for (let i = 0; i < 30; i++) {
    curve.follow(i/30);
    }
    }
    */
  }
}


class Cowboy {
  constructor() {
    loadImage('assets/horse.png', (img) => {
      this.image = img;
    }, () => {
      console.log('uh oh')
    });
  }
  blit(x, y) {
    image(this.image, x - (this.image.width / 2), y - (this.image.height / 2))
  }
}
function drawPath(i) {
  const W = 90;
}

/*
Path creation:
Paths consist of Bezier curves along a simple unit grid (unit size in pixels to be determined).
The path randomly decides if it's going to (+1, 0), (0, +1), (+1, +1), (-1, 0), (0, -1), or (-1, -1)
It just can't choose the inverse of whichever one it chose last (or else it will go back on itself).

Paths can have intersections, where they meet with other paths.
*/

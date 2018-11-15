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
  noFill();
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    if (context_switcher.state === 'start') {
      context_switcher.start_frame = frameCount;
    }
    context_switcher.state = 'play';
  }
  if (keyCode === RIGHT_ARROW) {
    context_switcher.state = 'pause';
  }

}

function draw() {
  if (frameCount === 1) {
    background('#619f3f')
    road.draw();
  }

  if (context_switcher.state === 'play') {
    background('#619f3f')
    road.draw()
  }
}

class ContextSwitcher {
  constructor() {
    this.state = 'start';
    this.start_frame = 0;
  }
}

class PathSegment {
  constructor(x1, y1, x2, y2, x3, y3, x4, y4) {
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.x3 = x3
    this.y3 = y3
    this.x4 = x4
    this.y4 = y4
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


function tile(i, unit) {
    /*
    Creates an i * unit by i * unit downwardly descending tile
    */
    const start_coord = i * unit;
    const end_coord   = (i + 1) * unit;
    const controls = [start_coord + Math.random() * unit,
      start_coord + Math.random() * unit,
      start_coord + Math.random() * unit,
      start_coord + Math.random() * unit
    ]
    return new PathSegment(start_coord, start_coord, controls[0], controls[1], controls[2], controls[3], end_coord, end_coord);
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
      const new_curve = tile(i, this.unit);
      this.curves.push(new_curve);
    }
  }

  draw() {
    for (let a_curve of this.curves) {
      a_curve.draw();
    }


    /* now blit the cowboy */
    const divisor        = this.num_curves * this.num_segments;

    const frame_counter  = Math.floor((frameCount - context_switcher.start_frame) / 1.6)
    const position       = frame_counter % divisor;
    const position_index = position % this.num_segments;
    const curve_index    = Math.floor(position / this.num_segments);

    //console.table(divisor, frame_counter, position, curve_index, position_index);
    this.curves[curve_index].follow(position_index / this.num_segments);
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

function new_tile(i, unit, orientation) {
    const top_left = i * unit;
    const bottom_right   = (i + 1) * unit;
    const controls = [
      top_left + Math.random() * unit,
      top_left + Math.random() * unit,
      top_left + Math.random() * unit,
      top_left + Math.random() * unit
    ]
    const start_x, start_y, end_x, end_y;
    switch(orientation) {
      case 'se':
        start_x = top_left;
        start_y = top_left;
        end_x   = bottom_right;
        end_y   = bottom_right;
        break;
      case 's':
        start_x = top_left;
        start_y = top_left;
        end_x   = top_left;
        end_y   = bottom_right;
        break;
      case 'sw':
        start_x = bottom_right;
        start_y = top_left;
        end_x   = top_left;
        end_y   = bottom_right;
        break;
    }

    return new PathSegment(start_x, start_y, controls[0], controls[1], controls[2], controls[3], end_x, end_y);
}

/*
Path creation:
Paths consist of Bezier curves along a simple unit grid (unit size in pixels to be determined).
The path randomly decides if it's going to (+1, 0), (0, +1), (+1, +1), (-1, 0), (0, -1), or (-1, -1)
It just can't choose the inverse of whichever one it chose last (or else it will go back on itself).

Paths can have intersections, where they meet with other paths.
*/

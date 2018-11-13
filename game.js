let cowboy;
/* how appropriate */

function preload() {
  cowboy = new Cowboy();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background('#619f3f')
  noFill();
  new Path();
}

class Bezier {
  constructor(x1, y1, x2, y2, x3, y3, x4, y4) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.x3 = x3;
    this.y3 = y3;
    this.x4 = x4;
    this.y4 = y4;
  }

  draw() {
    strokeWeight(50);
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

class Path {
  constructor() {
    const unit = 90;
    const num_curves = 6;
    const num_frames = 30;
    const curves = [];

    for (let i=0; i<num_curves; i++) {
      const bez = new Bezier(i*unit, i*unit, (i+1) * unit, i*unit, i*unit, (i+2)*unit, (i+1)*unit, (i+1)*unit);
      curves.push(bez);
    }

    for (curve of curves) {
      curve.draw()
    }


    /* now blit the cowboy */
    const frame_counter = Math.floor(frameCount/1.4)
    const divisor = num_curves * num_frames;
    const position = frame_counter % divisor;
    const curve_index = Math.floor(position / num_frames);
    const position_index = position % num_frames;
    console.table(divisor, position, curve_index, position_index);
    curves[curve_index].follow(position_index/num_frames);

    /*
    for (curve of curves) {
      for (let i = 0; i < 30; i++) {
        curve.follow(i/30);
      }
    }
    */
  }
}

class Cowboy {
  constructor() {
    loadImage('assets/horse1.png', (img) => {
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

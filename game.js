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

class Atlas {
  constructor(width, height) {
    this.directions = ['n', 'nw', 'w', 'sw', 's', 'se', 'e', 'ne']

    this.next_for_direction = {
      'n':  [0, 1],
      'ne': [-1, 1],
      'e':  [-1, 0],
      'se': [-1, -1],
      's':  [0, -1],
      'sw': [1, -1],
      'w':  [1, 0],
      'nw': [1, 1],
      /*
      this is the inverse, which might be useful sometime
      'n':  [0, -1],
      'ne': [1, -1],
      'e':  [1, 0],
      'se': [1, 1],
      's':  [0, 1],
      'sw': [-1, 1],
      'w':  [-1, 0],
      'nw': [-1, -1],
      */
    }

    this.atlas = [];
    /* cut this when helpers are done*/
    for (let i = 0; i < height; i++) {
      this.atlas.push( [ new MapTile('e', 'w'), new MapTile('n', 's'), new MapTile('nw', 'sw'),
        new MapTile('se', 'sw'), new MapTile('nw', 'sw'), new MapTile('nw', 'se') ])
    }
    /* endcut */
    this.fake_atlas = this.generate_empty_atlas(6, 6)
    this.create_path([3, 3], this.fake_atlas)
    console.log(this.fake_atlas);
  }

  generate_empty_atlas(width, height) {
    const generated_atlas = [];
    for (let i = 0; i < height; i++) {
      const generated_row = [];
      for (let j = 0; j < width; j++) {
        generated_row.push(0)
      }
      generated_atlas.push(generated_row)
    }
    return generated_atlas;
  }

  create_path(start_point, atlas) {
    let point = start_point
    let source = 'n';
    let destination, next_delta, next_point, forbidden_destinations, allowed_destinations;
    while (true) {
      forbidden_destinations = [source]
      allowed_destinations = this.directions.filter(val => ! forbidden_destinations.includes(val));

      destination = this.return_random_direction(this.directions);
      next_delta = this.next_for_direction[destination];
      /* double check this arithmetic to make sense with how things are drawn */
      next_point = [point[0] + next_delta[0], point[1] + next_delta[1]]
      console.log('next_point', next_point);

      if (atlas[next_point[0]] === undefined || atlas[next_point[0]][next_point[1]] === undefined) {
        return;
      }
      if (atlas[next_point[0]][next_point[1]] !== 0) {
        return;
      }
      atlas[point[0]][point[1]] = new MapTile(source, destination);
      point = next_point;
      source = this.inverse_direction(destination);
    }
  }

  return_random_direction(directions) {
    /* directions need not be this.directions
    can be an already limited list of directions. */
    return directions[Math.floor(Math.random()*directions.length)];
  }

  inverse_direction(direction) {
    const direction_index = this.directions.indexOf(direction);
    const inverse_index   = (this.directions.length + direction_index) % this.directions.length
    return this.directions[inverse_index]
  }

  traverse_path() {
  }
}

class MapTile {
  constructor(source, destinations) {
    this.source = source;
    this.destinations = destinations;
  }
}

class Path {
  constructor() {
    this.unit = 100;
    this.num_curves = 6;
    this.num_segments = 30;
    this.curves = [];
    const atlas = new Atlas(this.num_curves, this.num_curves);
    console.log(atlas.atlas)
    /* these for loops need to instead trace the path of the curve */
    for (let i=0; i<this.num_curves; i++) {
      for (let j=0; j<this.num_curves; j++) {
        /* these two lines should be okay, eventually need to split atlas.destinations and create a separate Path */
        const new_curve = new_tile(i, j, this.unit, atlas.atlas[i][j].source, atlas.atlas[i][j].destinations)
        this.curves.push(new_curve);
      }
    }
  }

  draw() {
    for (let a_curve of this.curves) {
      a_curve.draw();
    }


    /* now blit the cowboy */
    const divisor        = this.num_curves ** 2 * this.num_segments;

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

function get_pair_for_direction(left, top, unit, direction) {
  const half_unit = Math.floor(unit / 2);
  const pair_for_direction = {
    'n':  [half_unit, 0],
    'ne': [unit, 0],
    'e':  [unit, half_unit],
    'se': [unit, unit],
    's':  [half_unit, unit],
    'sw': [0, unit],
    'w':  [0, half_unit],
    'nw': [0, 0],
  }
  return pair_for_direction[direction];
}

function new_tile(left_index, top_index, unit, source, destination) {
  const left = left_index * unit;
  const top = top_index * unit;
  const controls = [
    left + Math.random() * unit,
    top + Math.random() * unit,
    left + Math.random() * unit,
    top + Math.random() * unit
  ]
  let start_x, start_y, end_x, end_y;
  [start_x, start_y] = get_pair_for_direction(left_index, top_index, unit, source);
  [end_x, end_y]     = get_pair_for_direction(left_index, top_index, unit, destination);
  start_x += left;
  start_y += top;
  end_x += left;
  end_y += top;

  return new PathSegment(start_x, start_y, controls[0], controls[1], controls[2], controls[3], end_x, end_y);
}

/*
Path creation:
Paths consist of Bezier curves along a simple unit grid (unit size in pixels to be determined).
The path randomly decides if it's going to (+1, 0), (0, +1), (+1, +1), (-1, 0), (0, -1), or (-1, -1)
It just can't choose the inverse of whichever one it chose last (or else it will go back on itself).

Paths can have intersections, where they meet with other paths.
*/

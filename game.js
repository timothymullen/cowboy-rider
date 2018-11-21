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
    translate(-x, -y);
  }
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
    }
    this.previous_for_direction = {
      'n':  [0, -1],
      'ne': [1, -1],
      'e':  [1, 0],
      'se': [1, 1],
      's':  [0, 1],
      'sw': [-1, 1],
      'w':  [-1, 0],
      'nw': [-1, -1],
    }

    this.atlas = this.generate_empty_atlas(20, 20)
    this.path = this.create_path([3, 3], this.atlas)
    console.log(this.path, this.atlas);
  }

  generate_empty_atlas(width, height) {
    /* returns an w x h 0 array */
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

  check_index(x, y) {
    if (y < this.atlas.length && x < this.atlas[y].length) {
      console.log('oh', x, y)
      return true;
    }
    console.log('no', x, y)
    return false;
  }

  get_point(x, y) {
    if (this.check_index(x, y)) {
      return this.atlas[y][x];
    }
  }

  get_source(x, y) {
    if (this.check_index(x, y)) {
      return this.atlas[y][x].source;
    }
  }

  get_destination(x, y) {
    if (this.check_index(x, y)) {
      return this.atlas[y][x].destinations;
    }
  }

  insert_tile(x, y, tile) {
    if (this.check_index(x, y)) {
      this.atlas[y][x] = tile;
    }
  }

  create_path(start_point, atlas) {
    let point = start_point
    let source = 'n';
    let destination, next_delta, next_point, forbidden_destinations, allowed_destinations, tile;
    const path = []
    while (true) {
      forbidden_destinations = [source]
      allowed_destinations = this.directions.filter(val => ! forbidden_destinations.includes(val));

      destination = this.return_random_direction(allowed_destinations);
      next_delta = this.next_for_direction[destination];
      /* double check this arithmetic to make sense with how things are drawn */
      next_point = [point[0] + next_delta[0], point[1] + next_delta[1]]
      console.log(destination);
      tile = new MapTile(source, destination);
      console.log(tile, point[0], point[1])
      this.insert_tile(point[0], point[1], tile)
      path.push([point[0], point[1]]);

      if (atlas[next_point[0]] === undefined || atlas[next_point[0]][next_point[1]] === undefined) {
        return path;
      }
      if (atlas[next_point[0]][next_point[1]] !== 0) {
        return path;
      }
      point = next_point;
      source = this.inverse_direction(destination);
    }
    return path;
  }

  return_random_direction(directions) {
    /* directions need not be this.directions
    can be an already limited list of directions. */
    return directions[Math.floor(Math.random()*directions.length)];
  }

  inverse_direction(direction) {
    const direction_index = this.directions.indexOf(direction);
    const inverse_index   = (this.directions.length / 2 + direction_index) % this.directions.length
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
    this.atlas = new Atlas(this.num_curves, this.num_curves);
    /* these for loops need to instead trace the path of the curve */
    for (let tile of this.atlas.path) {
      console.log(tile);
      const x = tile[0];
      const y = tile[1];
      console.log(this.atlas.atlas[y][x])
      const new_curve = new_tile(x, y, this.unit, this.atlas.get_source(x, y), this.atlas.get_destination(x, y))
      this.curves.push(new_curve);
    };
  }

  draw() {
    for (let a_curve of this.curves) {
      a_curve.draw();
    }


    /* now blit the cowboy */
    const divisor        = this.atlas.path.length * this.num_segments;

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
    'n':  [-half_unit, 0],
    'ne': [-unit, 0],
    'e':  [-unit, -half_unit],
    'se': [-unit, -unit],
    's':  [-half_unit, -unit],
    'sw': [0, -unit],
    'w':  [0, -half_unit],
    'nw': [0, 0],
  }
  const next_for_direction = {
    'n':  [0, 1],
    'ne': [-1, 1],
    'e':  [-1, 0],
    'se': [-1, -1],
    's':  [0, -1],
    'sw': [1, -1],
    'w':  [1, 0],
    'nw': [1, 1],
  }
  return next_for_direction[direction].map(x => x * half_unit);

  return pair_for_direction[direction];
}


function new_tile(left_index, top_index, unit, source, destination) {
  const left = left_index * unit;
  const top = top_index * unit;
  const controls = [
    left - Math.random() * unit,
    top - Math.random() * unit,
    left - Math.random() * unit,
    top - Math.random() * unit
  ]
  let start_x, start_y, end_x, end_y;
  console.log(get_pair_for_direction, left_index, top_index, unit, source, destination);
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

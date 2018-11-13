function setup() {
  createCanvas(windowWidth, windowHeight);
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
    strokeWeight(8);
    stroke('#794446');
    bezier(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3, this.x4, this.y4)
  }

  follow(t) {
    const x = bezierPoint(this.x1, this.x2, this.x3, this.x4, t);
    const y = bezierPoint(this.y1, this.y2, this.y3, this.y4, t);
    strokeWeight(1);
    stroke(255, 102, 0);
    ellipse(x, y, 5, 5);
  }
}

function drawPath(i) {
  const W = 90;
  const bez = new Bezier(i*W, i*W, (i+1) * W, i*W, i*W, (i+2)*W, (i+1)*W, (i+1)*W);
  bez.draw()
  for (let i = 0; i < 30; i++) {
    bez.follow(i/30);
  }
}

function draw() {
  background('#619f3f')
  noFill();
  for (let i=0; i<5; i++) {
    drawPath(i)
  }
}

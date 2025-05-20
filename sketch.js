let particles = [];
let collisionPulseLength = 50;
let collisionPulseOpacity = 30;
let circleDragRate = 0.985;
let collisionEnergyTransfer = 0; //!!!!
let initialSpeed = [0,0];
let circleSizeRange = [10,30]
let particleCount = 400;

let sliders = [];
let videoSpeed = 1;
let backgroundDrag = false;

videoSpeed = 1;
function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(random(width), random(height)));
  }
  //sliders.push(new Slider(50,70,0.9,0.999,0.99,0,"circleDragRate"));
  
  video = createVideo("images/Landscape Animation - Draft 2.mp4");
  video.hide();            // Hide default DOM element, we'll draw it on canvas
  video.volume(0);         // Mute the video
  video.loop();            // Loop the video
  video.speed(videoSpeed); // Set initial speed
  videoWidth = 1920*2
  videoHeight = 1080*2


  
}

function mousePressed(){
  backgroundDrag = !backgroundDrag;
}
function draw() {
  
  if (backgroundDrag == true){ background (0,15);}
  else( background(0));

  
  // Update particles
  let totalVelocity = 0;
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    velocityOfParticle = particles[i].vel
    totalVelocity += particles[i].vel.mag()
  }

  imageMode(CENTER);
  /*
  videoHeightToWindowRatio = video.Height/window.Height;
  console.log(videoHeightToWindowRatio)
  */

  tint(255, 100);
  image(video, windowWidth/2,windowHeight/2, videoWidth/2,videoHeight/2, 10);
  video.speed(totalVelocity/1000 + 0.1);

  background(map(totalVelocity,particleCount,10*particleCount,0,200),0,0,0);

  

  // Handle collisions
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      let a = particles[i];
      let b = particles[j];
  
      let distAB = p5.Vector.dist(a.pos, b.pos);
      let minDist = (a.size + b.size) / 2;
  
      if (distAB < minDist) {
        // Collision normal and tangent
        let normal = p5.Vector.sub(b.pos, a.pos);
        let unitNormal = normal.copy().normalize();
        let unitTangent = createVector(-unitNormal.y, unitNormal.x);
  
        // Project velocities onto normal and tangent
        let v1n = unitNormal.dot(a.vel);
        let v1t = unitTangent.dot(a.vel);
        let v2n = unitNormal.dot(b.vel);
        let v2t = unitTangent.dot(b.vel);
  
        // Swap the normal components (equal mass)
        let v1nFinal = v2n;
        let v2nFinal = v1n;
  
        // Reconstruct final velocities
        let v1nVec = unitNormal.copy().mult(v1nFinal);
        let v1tVec = unitTangent.copy().mult(v1t);
        let v2nVec = unitNormal.copy().mult(v2nFinal);
        let v2tVec = unitTangent.copy().mult(v2t);
  
        a.vel = p5.Vector.add(v1nVec, v1tVec);
        b.vel = p5.Vector.add(v2nVec, v2tVec);
  
        // Separate particles to avoid overlap
        let overlap = minDist - distAB;
        let correction = unitNormal.copy().mult(overlap / 2);
        a.pos.sub(correction);
        b.pos.add(correction);

        // Pulsing white when they collide
        a.pulseLength = collisionPulseLength; // Set a pulse duration (frames)
        b.pulseLength = collisionPulseLength;
      }
    }
  }
  

  // Display particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].display();
  }

  push()
  fill(255,255,255,30)
  textSize(20)
  text("‌Move mouse to advance time  \n‌ Click to toggle drag (laggy), refresh page to reset  \n‌Time Open: "+ int(millis() / 1000) + "s  \n‌ total velocity: " + totalVelocity.toFixed(0), 30,30,10000)
  pop()
  
  

  //eateSlider(x,y,minValue,maxValue,startValue,stepSize,sliderSize,text)
  //circledragrate

}


class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(initialSpeed[0],initialSpeed[1])); 
    
    this.acc = createVector(0, 0);
    this.size = random(circleSizeRange[0],circleSizeRange[1])**3/500;
    this.pulseLength = 0;
  }

  update() {
    // Mouse repulsion
    let mouse = createVector(mouseX, mouseY);
    let dir = p5.Vector.sub(this.pos, mouse);
    let d = dir.mag();
    if (d < 40) {
      dir.normalize();
      let force = 1000 / (d * d + 1);
      this.acc.add(dir.mult(force));
    }

    this.vel.add(this.acc);
    this.vel.limit(999);
    this.vel.mult(circleDragRate); // Slowly slows down
    this.pos.add(this.vel);
    this.acc.mult(0);

    // Edge bounce
    if (this.pos.x < 0 || this.pos.x > width) {
      this.vel.x = this.vel.x * -1;
      this.pos.x = constrain(this.pos.x, 0, width);
    }
    if (this.pos.y < 0 || this.pos.y > height) {
      this.vel.y = this.vel.y * -1;
      this.pos.y = constrain(this.pos.y, 0, height);
    }

    // Reduce pulse duration over time
    if (this.pulseLength > 0) {
      this.pulseLength = this.pulseLength-1;
    }
  }

  display() {
    // Determine the speed of the particle for coloring
    let speed = this.vel.mag();
    let maxSpeed = 5;
    let r,g,b;
    let opacity;

    if (speed >= 1){
    r = map(speed, 0, maxSpeed, 100, 255);
    g = map(speed, 0, maxSpeed, 100, 50);
    b = map(speed, 0, maxSpeed, 255, 0);
    opacity = 255;
    }
    else{
      r=100;
      g=100;
      b=255;
      opacity = speed*255 //second number is equal to number in if statement
    }
    //console.log(opacity);

    let pulseOpacityValue = this.pulseLength / collisionPulseLength * collisionPulseOpacity; //if pulseLength is 50, 50/50*30 to give +30 opacity. if pulseLength is 10, 10/50*30 to give +6 opacity.
    // If particle is pulsing after collision, make it pulse white
    fill(r + pulseOpacityValue, g + pulseOpacityValue, b + pulseOpacityValue, opacity); // Speed-based color
    
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}

/*
class Slider{
  constructor(x,y,minValue,maxValue,startValue,stepSize,text){
    slider = createSlider(minValue,maxValue,startValue,stepSize);
    slider.position(x, y);
    slider.size(20) //slider.size(sliderSize)
    text(text+": " + slider.value(),x+20,y)
  }
}
*/
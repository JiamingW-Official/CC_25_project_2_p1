let font;
let points = [];
let words = ["Elegance", "In", "The", "Sky"];
let currentWord = 0;
let sampleFactor = 0.1; // controls point density; lower -> more points
let fontSize = 300;     // large text size
let effectMode = 0;     // interactive text effect mode (0 to 8)

// Trail settings for the gradient cursor (short-lived)
let trails = [];
const trailLifetime = 100; // milliseconds
const cursorDiameter = 40;

function preload() {
  // Load your font (ensure "Lagency-Regular.otf" is in your project folder)
  font = loadFont("Lagency-Regular.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor(); // hide the default mouse pointer
  textFont(font);
  generatePoints();
}

function generatePoints() {
  // Center the current word on the canvas
  let word = words[currentWord];
  let bounds = font.textBounds(word, 0, 0, fontSize);
  let x = width / 2 - bounds.w / 2;
  let y = height / 2 + bounds.h / 2;
  points = font.textToPoints(word, x, y, fontSize, { sampleFactor: sampleFactor });
}

function draw() {
  background(30);

  // Update trail list with the current mouse position and timestamp.
  let currentTime = millis();
  trails.push({ x: mouseX, y: mouseY, t: currentTime });
  trails = trails.filter(trail => currentTime - trail.t <= trailLifetime);
  
  // Draw each trail with fading opacity.
  for (let trail of trails) {
    let age = (currentTime - trail.t) / trailLifetime;
    let alphaFactor = 1 - age;
    drawGradient(trail.x, trail.y, cursorDiameter, alphaFactor);
  }

  // --- Interactive Text Effects ---
  noStroke();
  fill(255);
  let t = millis() / 1000;
  let cx = width / 2;
  let cy = height / 2;
  
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let x = pt.x;
    let y = pt.y;
    let offsetX = 0;
    let offsetY = 0;
    
    switch (effectMode) {
      case 0:
        // Effect 0: Repulsion – points near the mouse are pushed away.
        let d = dist(x, y, mouseX, mouseY);
        if (d < 100) {
          let repulsion = map(d, 0, 100, 50, 0);
          let angleRepel = atan2(y - mouseY, x - mouseX);
          offsetX = cos(angleRepel) * repulsion;
          offsetY = sin(angleRepel) * repulsion;
        }
        x += offsetX;
        y += offsetY;
        break;
        
      case 1:
        // Effect 1: Wavy – a sine-wave based motion influenced by the mouse.
        offsetX = map(mouseX, 0, width, -20, 20);
        offsetY = map(mouseY, 0, height, -20, 20);
        let wave = sin(t * 2 + x * 0.05 + y * 0.05) * 10;
        x += offsetX + wave;
        y += offsetY + wave;
        break;
        
      case 2:
        // Effect 2: Perlin Noise – points morph with a noise-based offset.
        let noiseFactor = noise(x * 0.01 + t, y * 0.01 + t);
        offsetX = map(noiseFactor, 0, 1, -mouseX * 0.05, mouseX * 0.05);
        offsetY = map(noiseFactor, 0, 1, -mouseY * 0.05, mouseY * 0.05);
        x += offsetX;
        y += offsetY;
        break;
        
      case 3:
        // Effect 3: Ripple – points move radially based on a sine function.
        let dRipple = dist(x, y, mouseX, mouseY);
        let ripple = sin(t * 10 - dRipple * 0.1) * 10;
        let angleToMouse = atan2(y - mouseY, x - mouseX);
        x += cos(angleToMouse) * ripple;
        y += sin(angleToMouse) * ripple;
        break;
        
      case 4:
        // Effect 4: Spiral – points twist in a spiral based on their distance from center.
        let spiralStrength = map(mouseY, 0, height, -0.1, 0.1);
        let angleOffset = spiralStrength * dist(x, y, cx, cy);
        let dxSpiral = x - cx;
        let dySpiral = y - cy;
        let spiralX = dxSpiral * cos(angleOffset) - dySpiral * sin(angleOffset);
        let spiralY = dxSpiral * sin(angleOffset) + dySpiral * cos(angleOffset);
        x = cx + spiralX;
        y = cy + spiralY;
        break;
        
      case 5:
        // Effect 5: Drift Up – points gently float upward with a horizontal sway.
        let drift = map(mouseY, 0, height, 0.5, 2);
        y -= drift;
        offsetX = map(noise(x, t), 0, 1, -5, 5);
        x += offsetX;
        break;
        
      case 6:
        // Effect 6: Pulse Bounce – points pulse radially from the center.
        let dx = x - cx;
        let dy = y - cy;
        let dCenter = dist(x, y, cx, cy);
        let pulse = sin(t * 5 + dCenter * 0.05) * 20;
        let angle = atan2(dy, dx);
        x += cos(angle) * pulse;
        y += sin(angle) * pulse;
        break;
        
      case 7:
        // Effect 7: Magnetic – points are gently attracted toward the mouse.
        x = lerp(x, mouseX, 0.05);
        y = lerp(y, mouseY, 0.05);
        break;
        
      case 8:
        // Effect 8: Glitch – points jitter delicately with a noise-based offset.
        let glitchX = map(noise(x * 0.1, t * 10), 0, 1, -15, 15);
        let glitchY = map(noise(y * 0.1, t * 10), 0, 1, -15, 15);
        x += glitchX;
        y += glitchY;
        break;
    }
    
    ellipse(x, y, 3, 3);
  }
  
  // Display instructions.
  fill(200);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Effect Mode: " + effectMode +
       "\nPress 'e' to change mode (0-8)" +
       "\nUp/Down arrows change density", 10, 10);
}

function drawGradient(cx, cy, d, alphaFactor = 1) {
  let r = d / 2;
  for (let i = r; i > 0; i--) {
    let inter = map(i, 0, r, 0, 1);
    let c1 = color(200, 150, 255, 200 * alphaFactor);
    let c2 = color(50, 100, 255, 0);
    let col = lerpColor(c1, c2, inter);
    noStroke();
    fill(col);
    ellipse(cx, cy, i * 2, i * 2);
  }
}

function mousePressed() {
  // Cycle through the words on mouse press.
  currentWord = (currentWord + 1) % words.length;
  generatePoints();
}

function keyPressed() {
  // Press 'e' to cycle through text effect modes.
  if (key === 'e' || key === 'E') {
    effectMode = (effectMode + 1) % 9;
  }
  
  // Up/Down arrows adjust point density.
  if (keyCode === UP_ARROW) {
    sampleFactor = constrain(sampleFactor - 0.01, 0.05, 0.2);
    generatePoints();
  }
  if (keyCode === DOWN_ARROW) {
    sampleFactor = constrain(sampleFactor + 0.01, 0.05, 0.2);
    generatePoints();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generatePoints();
}

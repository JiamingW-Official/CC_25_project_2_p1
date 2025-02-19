let font;
let points = [];
let words = ["Elegance", "In", "The", "Sky"];
let currentWord = 0;
let sampleFactor = 0.1; // Controls point density (lower = more points)
let fontSize = 300;     // Text size
let effectMode = 0;     // Current effect (0 to 8)

// Effect names (0–8)
const effectNames = [
  "Repulsion", 
  "Wavy", 
  "Perlin Noise", 
  "Ripple", 
  "Spiral", 
  "Magnetic Pull", 
  "Distortion Ripple", 
  "Swirl", 
  "Bubble Expansion"
];

// Trail (cursor) configuration
let trails = [];
const trailLifetime = 100;  // 100ms lifetime for extremely short trail
const cursorDiameter = 40;   // Cursor size (diameter)

function preload() {
  // Load your font (ensure "Lagency-Regular.otf" is in your project folder)
  font = loadFont("Lagency-Regular.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor(); // Hide the default mouse pointer
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
  let currentTime = millis();

  // --- Draw a short-lived gradient trail at the mouse position ---
  trails.push({ x: mouseX, y: mouseY, t: currentTime });
  trails = trails.filter(trail => currentTime - trail.t <= trailLifetime);
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
    let d, factor, angle, swirlAngle;
    
    switch (effectMode) {
      // Old Effects (0–4)
      case 0:
        // Effect 0: Repulsion – Points near the mouse are pushed away.
        d = dist(x, y, mouseX, mouseY);
        if (d < 100) {
          factor = map(d, 0, 100, 50, 0);
          angle = atan2(y - mouseY, x - mouseX);
          offsetX = cos(angle) * factor;
          offsetY = sin(angle) * factor;
        }
        break;
        
      case 1:
        // Effect 1: Wavy – Sine-wave motion influenced by mouse position.
        offsetX = map(mouseX, 0, width, -20, 20);
        offsetY = map(mouseY, 0, height, -20, 20);
        let wave = sin(t * 2 + x * 0.05 + y * 0.05) * 10;
        offsetX += wave;
        offsetY += wave;
        break;
        
      case 2:
        // Effect 2: Perlin Noise – Points morph with a noise-based offset.
        let noiseFactor = noise(x * 0.01 + t, y * 0.01 + t);
        offsetX = map(noiseFactor, 0, 1, -mouseX * 0.05, mouseX * 0.05);
        offsetY = map(noiseFactor, 0, 1, -mouseY * 0.05, mouseY * 0.05);
        break;
        
      case 3:
        // Effect 3: Ripple – A radial ripple distorts the points.
        d = dist(x, y, mouseX, mouseY);
        let ripple = sin(t * 10 - d * 0.1) * 10;
        angle = atan2(y - mouseY, x - mouseX);
        offsetX = cos(angle) * ripple;
        offsetY = sin(angle) * ripple;
        break;
        
      case 4:
        // Effect 4: Spiral – Points twist around the canvas center.
        let spiralStrength = map(mouseY, 0, height, -0.1, 0.1);
        let angleOffset = spiralStrength * dist(x, y, cx, cy);
        let dx = x - cx;
        let dy = y - cy;
        let spiralX = dx * cos(angleOffset) - dy * sin(angleOffset);
        let spiralY = dx * sin(angleOffset) + dy * cos(angleOffset);
        x = cx + spiralX;
        y = cy + spiralY;
        break;
        
      // New Effects (5–8)
      case 5:
        // Effect 5: Magnetic Pull – Points are drawn toward the mouse.
        d = dist(x, y, mouseX, mouseY);
        if (d < 150) {
          factor = map(d, 0, 150, 0.8, 0);
          offsetX = (mouseX - x) * factor;
          offsetY = (mouseY - y) * factor;
        }
        break;
        
      case 6:
        // Effect 6: Distortion Ripple – A radial sine ripple warps the text.
        d = dist(x, y, mouseX, mouseY);
        factor = sin(d / 15 - t * 5) * map(d, 0, 200, 15, 0);
        angle = atan2(y - mouseY, x - mouseX);
        offsetX = cos(angle) * factor;
        offsetY = sin(angle) * factor;
        break;
        
      case 7:
        // Effect 7: Swirl – Points near the mouse swirl around it.
        d = dist(x, y, mouseX, mouseY);
        if (d < 200) {
          swirlAngle = map(d, 0, 200, PI / 2, 0);
          angle = atan2(y - mouseX, x - mouseX); // careful: we want around mouse
          // Better: compute relative to mouse
          angle = atan2(y - mouseY, x - mouseX) + swirlAngle;
          // Keep distance constant:
          offsetX = cos(angle) * d - (x - mouseX);
          offsetY = sin(angle) * d - (y - mouseY);
        }
        break;
        
      case 8:
        // Effect 8: Bubble Expansion – Points near the mouse are pushed outward.
        d = dist(x, y, mouseX, mouseY);
        if (d < 150) {
          factor = map(d, 0, 150, 30, 0);
          angle = atan2(y - mouseY, x - mouseX);
          offsetX = cos(angle) * factor;
          offsetY = sin(angle) * factor;
        }
        break;
    }
    
    // Draw the modified point.
    ellipse(x + offsetX, y + offsetY, 3, 3);
  }
  
  // Display current mode and instructions.
  fill(200);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Effect: " + effectNames[effectMode] + 
       "\nPress 'e' to change mode\nUp/Down arrows adjust density", 10, 10);
}

//
// Utility: Draws a radial gradient circle centered at (cx, cy) with diameter d.
// The gradient interpolates from light purple (center) to blue (edge).
// alphaFactor scales the alpha for fading.
//
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
  // Cycle through words on mouse press.
  currentWord = (currentWord + 1) % words.length;
  generatePoints();
}

function keyPressed() {
  // Press 'e' to cycle through effects.
  if (key === 'e' || key === 'E') {
    effectMode = (effectMode + 1) % effectNames.length;
  }
  
  // Up/Down arrows adjust point density (and regenerate points).
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

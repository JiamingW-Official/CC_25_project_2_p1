let font;
let points = [];
let words = ["Elegance", "In", "The", "Sky"];
let currentWord = 0;
let sampleFactor = 0.1; // controls point density; lower => more points
let fontSize = 300;     // large text size
let effectMode = 0;     // interactive text effect mode (0 to 4)

// An array to store recent mouse positions for the trail effect.
let trails = [];
// Trail lifetime in milliseconds (now reduced to 100ms)
const trailLifetime = 100;
// Cursor size (diameter)
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
  // Clear background completely each frame.
  background(30);

  // Update trail list with the current mouse position and timestamp.
  let currentTime = millis();
  trails.push({ x: mouseX, y: mouseY, t: currentTime });

  // Remove trails older than trailLifetime milliseconds.
  trails = trails.filter(trail => currentTime - trail.t <= trailLifetime);

  // Draw each trail with fading opacity based on its age.
  for (let trail of trails) {
    let age = (currentTime - trail.t) / trailLifetime; // normalized age (0 to 1)
    let alphaFactor = 1 - age; // fades linearly from 1 to 0 over trailLifetime
    drawGradient(trail.x, trail.y, cursorDiameter, alphaFactor);
  }

  // --- Interactive Text Effects (drawn on top) ---
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
        // Effect 1: Wavy – a sine‑wave based motion influenced by the mouse.
        offsetX = map(mouseX, 0, width, -20, 20);
        offsetY = map(mouseY, 0, height, -20, 20);
        let wave = sin(t * 2 + x * 0.05 + y * 0.05) * 10;
        x += offsetX + wave;
        y += offsetY + wave;
        break;
        
      case 2:
        // Effect 2: Perlin Noise – points morph with a noise‑based offset.
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
    }
    
    ellipse(x, y, 3, 3);
  }
  
  // Optional: Display current mode and instructions.
  fill(200);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Effect Mode: " + effectMode + "\nPress 'e' to change mode\nUp/Down arrows change density", 10, 10);
}

// Draws a radial gradient circle centered at (cx, cy) with diameter d.
// The gradient interpolates from light purple (center) to blue (edge).
// The parameter alphaFactor (0-1) multiplies the alpha values for a fading effect.
function drawGradient(cx, cy, d, alphaFactor = 1) {
  let r = d / 2;
  // Loop from the outer edge (r) to the center (0)
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
    effectMode = (effectMode + 1) % 5;
  }
  
  // Up/Down arrows adjust point density (and regenerate the text points).
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

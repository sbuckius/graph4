let input, submitButton, saveGraphButton, savePatternButton, showGraphButton, showPatternButton;
let responses = {};
let responseList = [];
let responseImages = {};
let images = [];
let database;
let showPattern = false;
let totalResponses = 0;

function preload() {
  for (let i = 1; i <= 5; i++) {
    images.push(loadImage('images/weft' + i + '.jpg'));
  }
}

function setup() {
  createCanvas(800, 400);
  input = createInput();
  input.position(20, 20);

  submitButton = createButton('Submit');
  submitButton.position(input.x + input.width + 10, 20);
  submitButton.mousePressed(handleSubmit);

  saveGraphButton = createButton('Save Bar Graph');
  saveGraphButton.position(submitButton.x + submitButton.width + 10, 20);
  saveGraphButton.mousePressed(() => {
    showPattern = false;
    redraw();
    saveCanvas('bar_graph', 'png');
  });

  savePatternButton = createButton('Save Jacquard Pattern');
  savePatternButton.position(saveGraphButton.x + saveGraphButton.width + 10, 20);
  savePatternButton.mousePressed(() => {
    showPattern = true;
    redraw();
    saveCanvas('jacquard_pattern', 'png');
  });

  showGraphButton = createButton('Show Bar Graph');
  showGraphButton.position(savePatternButton.x + savePatternButton.width + 10, 20);
  showGraphButton.mousePressed(() => {
    showPattern = false;
    redraw();
  });

  showPatternButton = createButton('Show Pattern');
  showPatternButton.position(showGraphButton.x + showGraphButton.width + 10, 20);
  showPatternButton.mousePressed(() => {
    showPattern = true;
    redraw();
  });

const firebaseConfig = {
  apiKey: "AIzaSyCSAOhgQ9wn4Yw1p1B4Qohx19fDIy_MV44",
  authDomain: "graph2-9ef9c.firebaseapp.com",
  projectId: "graph2-9ef9c",
  storageBucket: "graph2-9ef9c.firebasestorage.app",
  messagingSenderId: "1038101689471",
  appId: "1:1038101689471:web:7f64c54a4d1d1e5ff33b4a"
};

  firebase.initializeApp(firebaseConfig);
  database = firebase.database();

  database.ref("responses").on("child_added", snapshot => {
    let response = snapshot.val().response;
    totalResponses++;

    if (totalResponses >= 100) {
      alert("100 responses reached — restarting graph.");
      resetGraph();
      return;
    }

    if (responses[response]) {
      responses[response]++;
    } else {
      responses[response] = 1;
      responseList.push(response);
      responseImages[response] = random(images);
    }

    redraw();
  });

  noLoop();
}

function handleSubmit() {
  let val = input.value().trim();
  if (val !== "") {
    database.ref("responses").push({ response: val, timestamp: Date.now() });
    input.value('');
  }
}

function draw() {
  background(255);
  if (showPattern) {
    drawJacquardPattern();
  } else {
    drawBarGraph();
  }
}

function drawBarGraph() {
  fill(0);
  textSize(16);
  text("Bar Graph of Responses", 20, 60);
  let barWidth = width / max(responseList.length, 1);
  let maxCount = max(Object.values(responses));

  for (let i = 0; i < responseList.length; i++) {
    let resp = responseList[i];
    let count = responses[resp];
    let barHeight = map(count, 0, maxCount, 0, height - 100);
    let img = responseImages[resp];

    if (img) {
      for (let y = height - barHeight - 20; y < height - 20; y += img.height) {
        for (let x = i * barWidth + 20; x < i * barWidth + 20 + barWidth - 30; x += img.width) {
          image(img, x, y, img.width, img.height);
        }
      }
    }

    fill(0);
    textSize(12);
    textAlign(CENTER);
    text(resp, i * barWidth + 20 + (barWidth - 30) / 2, height - 5);
  }
}

function drawJacquardPattern() {
  background(240);
  fill(0);
  textSize(16);
  text("Jacquard Textile Pattern", 20, 30);
  let tileSize = 80;

  for (let y = 40; y < height; y += tileSize) {
    for (let x = 0; x < width; x += tileSize) {
      let idx = (x / tileSize + y / tileSize) % responseList.length;
      let resp = responseList[Math.floor(idx)];
      let img = responseImages[resp];

      if (img) {
        tint(200, 180);
        image(img, x, y, tileSize, tileSize);
      }
    }
  }
  noTint();
}

function resetGraph() {
  database.ref("responses").remove();
  responses = {};
  responseList = [];
  responseImages = {};
  totalResponses = 0;
  showPattern = false;
  redraw();
}

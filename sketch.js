let input, submitButton, saveGraphButton, savePatternButton, showGraphButton, showPatternButton, restartButton, saveDataButton; 
let responses = {};
let responseList = [];
let responseImages = {};
let images = [];
let database;
let showPattern = false;
let totalResponses = 0;

function preload() {
  for (let i = 1; i <= 10; i++) {
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
  restartButton = createButton('Restart Graph');
  restartButton.position(showPatternButton.x + showPatternButton.width + 10, 20);
restartButton.mousePressed(() => {
  if (confirm("Are you sure you want to reset the graph? This will delete all data.")) {
    resetGraph();
  }
});

saveDataButton = createButton('Save Data');
saveDataButton.position(restartButton.x + restartButton.width + 10, 20);
saveDataButton.mousePressed(saveDataToCSV);



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
  textSize(10);
  text("Does AI support you by saving you time **at home**?", 50, 50);
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
  text("Random Jacquard Textile Pattern", 20, 30);

  let tileSize = 80;

  for (let y = 40; y < height; y += tileSize) {
    for (let x = 0; x < width; x += tileSize) {
      if (responseList.length === 0) continue;

      let randIndex = floor(random(responseList.length));
      let resp = responseList[randIndex];
      let img = responseImages[resp];

      if (img) {
        // Add variation: scale and tint
        let scale = random(0.8, 1.2);
        tint(random(150, 255), random(150, 255), random(150, 255), 200);
        image(img, x, y, tileSize * scale, tileSize * scale);
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

function saveDataToCSV() {
  let rows = [["Response", "Count"]];
  for (let resp of responseList) {
    rows.push([resp, responses[resp]]);
  }
  let csv = rows.map(row => row.join(",")).join("\n");
  let blob = new Blob([csv], { type: 'text/csv' });
  let a = createA(URL.createObjectURL(blob), 'bar_graph_data.csv');
  a.attribute("download", "bar_graph_data.csv");
  a.hide();
  a.elt.click();
}

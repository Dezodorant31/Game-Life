
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startStopBtn = document.getElementById('startStopBtn');
const stepBtn = document.getElementById('stepBtn');
const clearBtn = document.getElementById('clearBtn');
const resetBtn = document.getElementById('resetBtn');
const randomBtn = document.getElementById('randomBtn');
const cellSizeInput = document.getElementById('cellSize');
const wrapCheckbox = document.getElementById('wrapCheckbox');
const patternInput = document.getElementById('pattern');
const parsePatternBtn = document.getElementById('parsePatternBtn');
const resultElement = document.getElementById('result');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const interactionCheckbox = document.getElementById('interactionCheckbox');
const fillRadiusSlider = document.getElementById('fillRadiusSlider');
const fillRadiusValue = document.getElementById('fillRadiusValue');
const fillShapeRadios = document.getElementsByName('fillShape');
const patternSelector = document.getElementById('patternSelector');

canvas.width = 720;
canvas.height = 480;
let cellSize = parseInt(cellSizeInput.value);
let fillRadius = parseInt(fillRadiusSlider.value);
let isRunning = false;
let grid, rows, cols;
let isMouseDown = false;
let mouseButton = null;

let radius = 1; // R1: Радиус соседства — 1
let cellStates = 2; // C2: Два состояния клетки — живая и мёртвая
let maxNeighbors = 8; // M8: Максимум соседей — 8
let survivalRange = [2, 3]; // S2..3: Клетка остаётся живой, если у неё 2 или 3 живых соседа
let birthRange = [3, 3]; // B3..3: Клетка рождается, если у неё ровно 3 живых соседа
let neighborhood = "M"; // NM: Моорское соседство

const initialSettings = {
    radius: 1,
    cellStates: 2,
    maxNeighbors: 8,
    survivalRange: [2, 3],
    birthRange: [3, 3],
    neighborhood: "M",
    pattern: "R1/C2/M8/S2..3/B3..3/NM"
};

const patterns = {
    glider: [
        { row: 0, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 }
    ],
    block: [
        { row: 0, col: 0 }, { row: 0, col: 1 },
        { row: 1, col: 0 }, { row: 1, col: 1 }
    ],
    beehive: [
        { row: 0, col: 1 }, { row: 0, col: 2 },
        { row: 1, col: 0 }, { row: 1, col: 3 },
        { row: 2, col: 1 }, { row: 2, col: 2 }
    ],
    loaf: [
        { row: 0, col: 1 }, { row: 0, col: 2 },
        { row: 1, col: 0 }, { row: 1, col: 3 },
        { row: 2, col: 1 }, { row: 2, col: 3 },
        { row: 3, col: 2 }
    ],
    boat: [
        { row: 0, col: 0 }, { row: 0, col: 1 },
        { row: 1, col: 0 }, { row: 1, col: 2 },
        { row: 2, col: 1 }
    ],
    tub: [
        { row: 0, col: 1 },
        { row: 1, col: 0 }, { row: 1, col: 2 },
        { row: 2, col: 1 }
    ],
    blinker: [
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: 2, col: 1 }
    ],
    toad: [
        { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 },
        { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }
    ],
    beacon: [
        { row: 0, col: 0 }, { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 2, col: 3 },
        { row: 3, col: 2 }, { row: 3, col: 3 }
    ],
    pulsar: [
        { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 },
        { row: 2, col: 0 }, { row: 2, col: 5 }, { row: 2, col: 7 }, { row: 2, col: 12 },
        { row: 3, col: 0 }, { row: 3, col: 5 }, { row: 3, col: 7 }, { row: 3, col: 12 },
        { row: 4, col: 0 }, { row: 4, col: 5 }, { row: 4, col: 7 }, { row: 4, col: 12 },
        { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 8 }, { row: 5, col: 9 }, { row: 5, col: 10 },
        { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 8 }, { row: 7, col: 9 }, { row: 7, col: 10 },
        { row: 8, col: 0 }, { row: 8, col: 5 }, { row: 8, col: 7 }, { row: 8, col: 12 },
        { row: 9, col: 0 }, { row: 9, col: 5 }, { row: 9, col: 7 }, { row: 9, col: 12 },
        { row: 10, col: 0 }, { row: 10, col: 5 }, { row: 10, col: 7 }, { row: 10, col: 12 },
        { row: 12, col: 2 }, { row: 12, col: 3 }, { row: 12, col: 4 }, { row: 12, col: 8 }, { row: 12, col: 9 }, { row: 12, col: 10 }
    ],
    gosperGliderGun: [
        { row: 1, col: 25 },
        { row: 2, col: 23 },
        { row: 2, col: 25 },
        { row: 3, col: 21 },
        { row: 3, col: 22 },
        { row: 4, col: 21 },
        { row: 4, col: 22 },
        { row: 5, col: 21 },
        { row: 5, col: 22 },
        { row: 6, col: 23 },
        { row: 6, col: 25 },
        { row: 7, col: 25 },
        { row: 3, col: 35 },
        { row: 3, col: 36 },
        { row: 4, col: 35 },
        { row: 4, col: 36 }
    ],
};

function init() {
    rows = Math.floor(canvas.height / cellSize);
    cols = Math.floor(canvas.width / cellSize);
    grid = new Array(rows).fill(null).map(() => new Array(cols).fill(0));
    drawGrid();
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.beginPath();
            ctx.rect(col * cellSize, row * cellSize, cellSize, cellSize);
            ctx.fillStyle = grid[row][col] ? 'black' : 'white';
            ctx.fill();
            ctx.stroke();
        }
    }
}

function step() {
    const newGrid = grid.map(arr => [...arr]);
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const neighbors = countNeighbors(row, col);
            if (grid[row][col] === 1) {
                if (neighbors < survivalRange[0] || neighbors > survivalRange[1]) newGrid[row][col] = 0;
            } else {
                if (neighbors >= birthRange[0] && neighbors <= birthRange[1]) newGrid[row][col] = 1;
            }
        }
    }
    grid = newGrid;
    drawGrid();
}

function countNeighbors(row, col) {
    let count = 0;
    const directionsMoore = [
        { dx: -1, dy: -1 }, { dx: -1, dy: 0 }, { dx: -1, dy: 1 },
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
        { dx: 1, dy: -1 }, { dx: 1, dy: 0 }, { dx: 1, dy: 1 }
    ];
    const directionsVonNeumann = [
        { dx: 0, dy: -1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }
    ];

    const directions = neighborhood === 'N' ? directionsVonNeumann : directionsMoore;

    for (const { dx, dy } of directions) {
        let newRow = row + dy;
        let newCol = col + dx;

        if (wrapCheckbox.checked) {
            newRow = (newRow + rows) % rows;
            newCol = (newCol + cols) % cols;
        }

        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            count += grid[newRow][newCol];
        }
    }
    return count;
}

function toggleRunning() {
    isRunning = !isRunning;
    startStopBtn.textContent = isRunning ? 'Стоп' : 'Старт';
    if (isRunning) {
        run();
    }
}

function run() {
    if (isRunning) {
        step();
        setTimeout(run, speedSlider.value * 1000); 
    }
}

function clearGrid() {
    grid = new Array(rows).fill(null).map(() => new Array(cols).fill(0));
    drawGrid();
}

function resetSettings() {
    radius = initialSettings.radius;
    cellStates = initialSettings.cellStates;
    maxNeighbors = initialSettings.maxNeighbors;
    survivalRange = initialSettings.survivalRange;
    birthRange = initialSettings.birthRange;
    neighborhood = initialSettings.neighborhood;
    patternInput.value = initialSettings.pattern;
    //parsePattern();
}

function randomFill() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            grid[row][col] = Math.random() > 0.5 ? 1 : 0;
        }
    }
    drawGrid();
}

function getCellCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;    // Соотношение масштабирования по X
    const scaleY = canvas.height / rect.height;  // Соотношение масштабирования по Y
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    return { row, col };
}

function toggleCellState(row, col, state) {
    const startRow = Math.max(0, row - fillRadius);
    const endRow = Math.min(rows - 1, row + fillRadius);
    const startCol = Math.max(0, col - fillRadius);
    const endCol = Math.min(cols - 1, col + fillRadius);
    const selectedShape = document.querySelector('input[name="fillShape"]:checked').value;

    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            if (selectedShape === 'circle') {
                const distance = Math.sqrt((r - row) ** 2 + (c - col) ** 2);
                if (distance <= fillRadius) {
                    grid[r][c] = state;
                }
            } else if (selectedShape === 'square') {
                grid[r][c] = state;
            }
        }
    }
    drawGrid();
}

function placePattern(pattern, startRow, startCol) {
    for (const { row, col } of patterns[pattern]) {
        const r = startRow + row;
        const c = startCol + col;
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
            grid[r][c] = 1;
        }
    }
    drawGrid();
}

function parsePattern() {
    const pattern = patternInput.value;
    const regex = /R(\d+)\/C(\d+)\/M(\d+)\/S(\d+)\.\.(\d+)\/B(\d+)\.\.(\d+)\/N(\w+)/;
    const match = pattern.match(regex);

    if (match) {
        const [_, R, C, M, Smin, Smax, Bmin, Bmax, N] = match;

        radius = parseInt(R);
        cellStates = parseInt(C);
        maxNeighbors = parseInt(M);
        survivalRange = [parseInt(Smin), parseInt(Smax)];
        birthRange = [parseInt(Bmin), parseInt(Bmax)];
        neighborhood = N;
		
        resultElement.innerHTML = `
            <strong>Parsed Parameters:</strong><br>
            Radius (R): ${radius}<br>
            States (C): ${cellStates}<br>
            Max Neighbors (M): ${maxNeighbors}<br>
            Survival Range (S): ${survivalRange.join(', ')}<br>
            Birth Range (B): ${birthRange.join(', ')}<br>
            Neighborhood (N): ${neighborhood}
        `;

        init();
    } else {
        resultElement.innerHTML = "Invalid pattern format!";
    }
}

canvas.addEventListener('mousedown', (event) => {
    if (interactionCheckbox.checked) {
        isMouseDown = true;
        mouseButton = event.button;
        const { row, col } = getCellCoordinates(event);
        if (mouseButton === 0) { // ЛКМ
            const selectedShape = document.querySelector('input[name="fillShape"]:checked').value;
            if (selectedShape === 'pattern') {
                const selectedPattern = patternSelector.value;
                placePattern(selectedPattern, row, col);
            } else {
                toggleCellState(row, col, 1);
            }
        } else if (mouseButton === 2) { // ПКМ
            toggleCellState(row, col, 0);
        }
    }
});

canvas.addEventListener('mousemove', (event) => {
    const { row, col } = getCellCoordinates(event);
    console.log(`Mouse at row: ${row}, col: ${col}`);
    if (isMouseDown && interactionCheckbox.checked) {
        if (mouseButton === 0) { // ЛКМ
            const selectedShape = document.querySelector('input[name="fillShape"]:checked').value;
            if (selectedShape === 'pattern') {
                const selectedPattern = patternSelector.value;
                placePattern(selectedPattern, row, col);
            } else {
                toggleCellState(row, col, 1);
            }
        } else if (mouseButton === 2) { // ПКМ
            toggleCellState(row, col, 0);
        }
    }
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

startStopBtn.addEventListener('click', toggleRunning);
stepBtn.addEventListener('click', step);
clearBtn.addEventListener('click', clearGrid);
resetBtn.addEventListener('click', resetSettings);
randomBtn.addEventListener('click', randomFill);
cellSizeInput.addEventListener('change', (event) => {
    cellSize = parseInt(event.target.value);
    init();
});

parsePatternBtn.addEventListener('click', parsePattern);
speedSlider.addEventListener('input', (event) => {
    speedValue.textContent = event.target.value;
});

fillRadiusSlider.addEventListener('input', (event) => {
    fillRadius = parseInt(event.target.value);
    fillRadiusValue.textContent = event.target.value;
});

fillShapeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (document.querySelector('input[name="fillShape"]:checked').value === 'pattern') {
            patternSelector.disabled = false;
        } else {
            patternSelector.disabled = true;
        }
    });
});

init();
const elementResult = document.querySelector('#result') // <div id="result"></div>
const boardWith = 5
const boardHeight = 2
const cellSize = 64 // width/height of single cell in pixels
let turnCount = 0 // Count of user's turns
let isGameOver = false // Game stops when true
let twoLastCellsMatch = false // Result of comparing for 2 last rotated Cells
let cellIndexPrev = null; // First rotated Cell
let cellIndexNow = null; // Second rotated Cell

// Images/Pictures to guess
const imagesToGuess = [
    'img/0.png', // 0
    'img/1.png', 
    'img/2.png', 
    'img/3.png', 
    'img/4.png', // 4
];
const IMG_BLANK = 'img/blank.png' // Non-rotated cell
const IMG_COVER = 'img/cover.png' // Non-rotated cell

// Array [boardWith * boardHeight] of imagesToGuess indexes 
const imagesToCells = []

// Array [boardWith * boardHeight] of <div> objects 
const cells = []
let indexesOnBoard = [] // Indexes of Cells array without matched Cells

generateBoard(); // Must called first

// End of code, only functions below ------------------------------------------

/**
 * Updates content in <span id="turns">...</span>
 */
function updateResult() {
//    Turns: <span id="turns" class="bold"></span>
    let textOutput = `Turn: ${turnCount}`
    if (isGameOver) {
        textOutput = `You win in ${turnCount} turns`
    }
    elementResult.textContent = textOutput;
}

/**
 * Randomizes imagesToCells array by pairs of imagesToGuess  
 */
function randomizeBoard() {
//    console.log('randomizeBoard()');
    imagesToCells.length = 0; // Empty array

    // Fill imagesToGuess indexes by pairs
    for (let i = 0; i < (boardWith * boardHeight / 2); i++) {
        const randomIndex = Math.round(Math.random() * (imagesToGuess.length - 1)) // 0..imagesToGuess.length - 1 
        // console.log('randomIndex:', randomIndex);
        imagesToCells.push(randomIndex)
        imagesToCells.push(randomIndex)
    }

    // Randomize filled array
    imagesToCells.sort(() => 0.5 - Math.random()) // Randomize by sorting
}


/**
 * Generates <div> cells in <div id="board">..
 */
function generateBoard() {
//    console.log('generateBoard()');
    const board = document.getElementById("board");

    // Set width and height by cellSize
    board.style.width = boardWith * cellSize + "px";
    board.style.height = boardHeight * cellSize + "px";

    randomizeBoard();
   
    // Generate width * height amount of cells
    cells.length = 0; // Empty array
    indexesOnBoard.length = 0; // Empty array
    for (let i = 0; i < boardWith * boardHeight; i++) {
        const div = document.createElement("div");
        div.setAttribute('class', 'cell')
        div.setAttribute('data-index', i)
        div.style.backgroundImage = `url('${IMG_COVER}')`
        // Set event
        div.addEventListener("click", handleCellClick);
      
        // For Debugging, show all Cells
        // toggleCell(div)

        // Add new div to Board and save in the Cells array
        cells.push(div)
        indexesOnBoard.push(i)
        board.appendChild(div);
    }
}    


/**
 * Shows the real image for given div
 */
function showCell(div) {
     const index = div.getAttribute('data-index') // 0..imagesToGuess.length - 1
     const indexOfImage = imagesToCells[index];
     const urlOfImage = imagesToGuess[indexOfImage]
     div.style.backgroundImage = `url('${urlOfImage}')` // '/img/...png' 
}

/**
 * Sets the cover image for given div
 */
function hideCell(div) {
    // Verify is cell already removed
    const index = +div.getAttribute('data-index')
    if (!indexesOnBoard.includes(index)) {
        // console.log('hideCell() - no need to hide, index:', index, indexesOnBoard)
        return // Cell is already removed   
    }

    // Set the Cover image as background
    div.style.backgroundImage = `url('${IMG_COVER}')`
}

/**
 * Toggles background image of given <div> between "blank" and imagesToGuess[]
 * @param {object} div - current Cell object <div> 
 */
function toggleCell(div) {
    if (div.style.backgroundImage && String(div.style.backgroundImage).includes(IMG_COVER) ) {
        // Show real image 
        showCell(div)
    } else {
        // Hide real image
        hideCell(div)
    }
}

/**
 * Toggles Cell to see the content and Toggles it back after some delay
 */
function temporaryShowCell(div) {    
    // Show Cell
    showCell(div)

    // Hide Cell after some interval
    setTimeout(() => {
        hideCell(div)
    }, 1000)    
}

/**
 * Shows and after delay removes matched Cells by Indexes
 */
function showAndRemoveMatchedCells(index1, index2) {
//    console.log(`showAndRemoveMatchedCells(${index1}, ${index2})`)

    // Did we click the same cell again?
    if (index1 == index2) {
        cellIndexPrev = cellIndexNow;
        cellIndexNow = null;
        return false // Don't compare same cells
    }

    // Find 1st Cell on Board
    const cell1 = cells.find((item) => item.getAttribute('data-index') == index1)
    showCell(cell1)
    const indexOfImage1 = imagesToCells[index1];
 
    // Find 2nd Cell on Board
    const cell2 = cells.find((item) => item.getAttribute('data-index') == index2)
    showCell(cell2)
    const indexOfImage2 = imagesToCells[index2];

    // Reset cache before timer
    cellIndexPrev = null;
    cellIndexNow = null;    

    // Remove same Cells
    if (indexOfImage1 == indexOfImage2) {
        // Remove Click events
        cell1.removeEventListener('click', handleCellClick)
        cell2.removeEventListener('click', handleCellClick) 

        // Remove index1 and index2 from indexesOnBoard
        indexesOnBoard = indexesOnBoard.filter((item) => item != index1 && item != index2);
    }

    // After delay update images of Cells
    setTimeout(() => {
        if (indexOfImage1 == indexOfImage2) {
            // Set Blank images
            cell1.style.backgroundImage = `url('${IMG_BLANK}')`
            cell2.style.backgroundImage = `url('${IMG_BLANK}')`

            // Update the result indicator
            isGameOver = Boolean(indexesOnBoard.length < 1)
            updateResult();
        } else {
            // Cells are different, turn them back
            hideCell(cell1)
            hideCell(cell2)
        } 
    }, 1000)

    return true
}

/**
 * Called on every Cell click
 */
function handleCellClick(event) {
    if (isGameOver) {
        updateResult()
        return
    }

    const div = event.target
    cellIndexPrev = cellIndexNow // Save index as prev
    cellIndexNow = div.getAttribute('data-index')

    // If cellIndexPrev exists, compare Cells
    if (cellIndexPrev) {
        if (showAndRemoveMatchedCells(cellIndexPrev, cellIndexNow)) {
            return; // Nothing to do more. Cells will be flipped back or removed
        }
    }

    // Show the content of the Cell for short time
    temporaryShowCell(div);
 
    // Update turn count
    turnCount = turnCount + 1
    updateResult()
}


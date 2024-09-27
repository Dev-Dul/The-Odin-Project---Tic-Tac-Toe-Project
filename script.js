// Start Of Game Engine
const table = document.getElementById("table");
const rows = table.rows;
const ret = [null];
//Gameboard Module
const gameboard = (function(){
    const gameGrid = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];


    function populate(row, col, value){
        gameGrid[row][col] = value;
    }

    let currentPlayer = null;
    function setCurrentPlayer(marker){
        currentPlayer = marker === 'X' ? 'O': 'X';
    }

    function getCurrentPlayer(){
        return currentPlayer;
    }

    let winner = null;

    function checkWin(){
        for(let i = 0; i < gameGrid.length; i++){
            if(gameGrid[i][0] !== null && gameGrid[i][0] === gameGrid[i][1] && gameGrid[i][0] === gameGrid[i][2]){
                winner = true;
            }else if(gameGrid[0][i] !== null && gameGrid[0][i] === gameGrid[1][i] && gameGrid[0][i] === gameGrid[2][i]){
                winner = true;
            }
        }
            if(gameGrid[0][0] !== null && gameGrid[0][0] === gameGrid[1][1] && gameGrid[0][0] === gameGrid[2][2]){
                winner = true;
            }
            
            if(gameGrid[0][2] !== null && gameGrid[0][2] === gameGrid[1][1] && gameGrid[0][2] === gameGrid[2][0]){
                winner = true;
            }
            console.log(gameGrid);
        return winner;   
    }

    function checkDraw(){
        let full = true;
        for(let i = 0; i < gameGrid.length; i++){
            for(let j = 0; j < gameGrid[i].length; j++){
                if(gameGrid[i][j] === null){
                    full = false;
                }
            }
        }
        
        if(full === true && checkWin() !== true){
            return true;
        }else{
            return false;
        }
    }

    function resetGame(){
        for(let i = 0; i < gameGrid.length; i++){
            let box = rows[i].cells;
            for(let j = 0; j < gameGrid[i].length; j++){
                gameGrid[i][j] = null;
                box[j].textContent = '';
                box[j].classList.remove("disabled");
            }
        }
        ret[0].firstClicked = null;
        currentPlayer = null;
        winner = null;
        displayController.displayNextPlayer(3);
        displayController.playerArr.forEach(function(arr, index){
            arr.destruct();
        });
        displayController.closeSecondModal();
        
    }

    return {setCurrentPlayer, getCurrentPlayer, checkWin, checkDraw, resetGame, populate};
})();

//Display Controller Module
const displayController = (function(){
        const wins = document.getElementById("wins");
        const winnums = document.getElementsByClassName("winnums");
        const nextPlayer = document.getElementById("next-player");
        const reset = document.getElementById("reset");
        const firstDialog = document.getElementById("first-dialog");
        const secondDialog = document.getElementById("second-dialog");
        const names = document.querySelectorAll(".names");
        const playerArr = [null, null];

        firstDialog.showModal();
        

        reset.addEventListener("click", () => {
            gameboard.resetGame();
            firstDialog.showModal();
        });

        function addNames(){
           Array.from(names).forEach(function(name, index){
                name.textContent = `${playerArr[index].name}  (${playerArr[index].marker})`;
            })
        }

        function closeModal(){
            firstDialog.close();
        }

        function closeSecondModal(){
            secondDialog.close();
        }

        // Announce the winner of the game using a modal
        function announceWinner(){
            let win = gameboard.getCurrentPlayer();
            win = win === "X" ? "O" : "X";
            let wname = null;
            for(let i = 0; i < playerArr.length; i++){
                if(win === playerArr[i].marker){            
                    winnums[i].textContent = playerArr[i].increaseLevel();
                    wname = playerArr[i].name;
                }
            }

            wins.textContent = `Player ${win}  (${wname}) wins`;
            secondDialog.showModal();
        }

        function announceDraw(){
             wins.textContent = "It's a draw!!!";
             secondDialog.classList.add("announce");
             secondDialog.showModal();
             setTimeout(() => {
                  secondDialog.classList.remove("announce");
                }, 300);
        }

        function displayNextPlayer(dummy = 1){
            if(dummy === 1){
                let nextp = gameboard.getCurrentPlayer();
                nextPlayer.textContent = `Player ${nextp}\'s turn`;       
            }else if(dummy === 2){
                nextPlayer.textContent = `Player ${playerArr[0].marker}\'s turn`;       
            }else{
                nextPlayer.textContent = '';
            }
        }

            return {playerArr, closeModal, closeSecondModal, announceWinner, announceDraw, displayNextPlayer, addNames};
})();

//Player object
function Player(name, marker){
    let level = 0;
    let click = 0;
    const addClick = () => ++click;
    const getClick = () => click;
    const increaseLevel = () => ++level;
    function destruct(){
        click = 0;
        level = 0;
        name = null;
        marker = null;
    }
    return {name, marker, addClick, getClick, increaseLevel, destruct};
}

// Driver Function
document.addEventListener("DOMContentLoaded", function(){
    // Get Player Data and Instantiate PLayer Objects
    const start = document.getElementById("start"); 
    let error = document.getElementById("error");
    let p_one = null, p_two, p_one_marker, p_two_marker, playerOne, playerTwo;
    start.addEventListener("click", () => {
        p_one = document.getElementById("player-one");
        p_one_marker = document.querySelector('input[name="marker"]:checked');
        p_two = document.getElementById("player-two");
        p_two_marker = document.querySelector('input[name="marker2"]:checked');

        if(p_one_marker.value === p_two_marker.value){
            error.style.top = "0%";
        }else{
            error.style.top = "-100%";
            displayController.closeModal();
            playerOne = Player(p_one.value, p_one_marker.value);
            playerTwo = Player(p_two.value, p_two_marker.value);
            displayController.playerArr[0] = playerOne;
            displayController.playerArr[1] = playerTwo;
            gameboard.setCurrentPlayer(playerOne.marker);
            displayController.displayNextPlayer(2);
            displayController.addNames();
        }
            console.log(p_one.value);
            console.log(p_two.value);
            console.log(p_one_marker.value);
            console.log(p_two_marker.value);
    });
    

    function winEngine(){
          if(gameboard.checkWin()){
            displayController.announceWinner();
          }else if(gameboard.checkDraw()) {
            displayController.announceDraw();
          }
    }

    const cels = [];
    const rws = table.rows;
    for(let i = 0; i < table.rows.length; i++){
        cels.push(...rws[i].cells);
    } 
    
    let state = {
        firstClicked: null,     
    } 
     Array.from(cels).forEach(function(cell, index){
            cell.addEventListener("click", function(){
                if(state.firstClicked === null){
                    state.firstClicked = this;
                    state.firstClicked.textContent = playerOne.marker;
                    ret[0] = state;
                    playerOne.addClick();

                }else if(cell.textContent.trim() !== ""){
                    cell.classList.add("disabled");
                }else{

                    cell.textContent = gameboard.getCurrentPlayer(); 
                    gameboard.setCurrentPlayer(cell.textContent);
                    if(cell.textContent === playerOne.marker){
                        playerOne.addClick();
                    }else if(cell.textContent === playerTwo.marker){
                        playerTwo.addClick();
                    }
                }
                console.log("Player one click:", playerOne.getClick());
                console.log("Player two click:", playerTwo.getClick());

                gameboard.populate(cell.parentNode.rowIndex, cell.cellIndex, cell.textContent);
                displayController.displayNextPlayer();
                winEngine();
            });
     });

   
});
// End Of Game Logic

// General Style Code
const bgAnimate = document.getElementById("bgAnimate");
const divs = 400;
for(let i = 0; i < divs; i++){
    const bx = document.createElement("div");
    bx.classList.add("bx");
    bgAnimate.appendChild(bx);
}

function getElems(count){
    const elems = [];
    const children = bgAnimate.children;
    for(let i = 0; i < count; i++){
        const randomIndex = Math.ceil(Math.random() * children.length);
        elems.push(children[randomIndex]);
    }
     return elems;
}

function addColor(){
    const allBoxes = document.querySelectorAll(".bx");
    allBoxes.forEach(element => element.classList.remove("color"));

    const elementsToColor = getElems(20);
    elementsToColor.forEach(element => element.classList.add("color"));
}

function startColorAnimation(){
    setInterval(addColor, 1000);
}

startColorAnimation();


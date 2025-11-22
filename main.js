import { cardsArray } from "/js/cardsObject.js";

let cardsDict = Object.entries(cardsArray);

function getRandomCard() {
    const randomCardIndex = Math.floor(Math.random() * cardsDict.length);

    const selectedCard = cardsDict.splice(randomCardIndex, 1)[0]; //Esto saca una carta random, y luego la elimina del objeto para que no vuelva a salir

    return selectedCard; //Esto me devuelve la carta entera, nombre + valor
}

window.addEventListener("load", () => {
    dealerStartRound();
});

////////VARIABLES////////
 
let dealerDeck = document.getElementById("dealer-deck");
let playerDeck = document.getElementById("player-deck");
let hit = document.getElementById("hit");
let stand = document.getElementById("stand");
let playerPoints = document.getElementById("player-points");
let dealerPoints = document.getElementById("dealer-points");
let winLoseDialog = document.getElementById("win-lose-dialog");
let dialogHeader = document.getElementById("dialog-header");
let winLoseText = document.getElementById("win-lose-text");
let moneyEarned = document.getElementById("money-earned");
let againButton = document.getElementById("again");

////////VARIABLES////////

let cardDealerId = 1;
let cardPlayerId = 1;


////////EVENTS////////

hit.addEventListener("mouseup", hitCard);
stand.addEventListener("mouseup", standCard);
againButton.addEventListener("mouseup", restartRound);

////////EVENTS////////


////////LOGIC////////



////////LOGIC////////



////////FUNCTIONS////////

function dealerStartRound() {
    //Declaro "cardName = cardsDict[0][0]" y "cardValue = cardsDict[0][1]", que recojo del return de "getRandomCard", 
    //ya que me devuelve el pair key/value entero
    const [cardName, cardValue] = getRandomCard();
    
    //Creo un nuevo <li> con la <img> justo despues del ultimo hijo del <ul>
    dealerDeck.insertAdjacentHTML("beforeend", `<li id='dealer-card-${cardDealerId}'><img src='/imgs/cards/${cardName}.png' alt=''></li>`);

    let newDealerCard = document.getElementById(`dealer-card-${cardDealerId}`); //Es la nueva carta que he creado y añadido para el dealer a la lista.

    newDealerCard.getBoundingClientRect(); //Esto fuerza a que el css aplique el translateY(0px) que le agregamos al elemento

    newDealerCard.style.transform = "translateY(0px)";

    let currentDealerPoints = parseInt(dealerPoints.innerHTML); //Puntos actuales del dealer
    let sumDealerPoints = currentDealerPoints + cardValue; //Los puntos sumados de los actuales del dealer + el valor de la carta que ha sacado
    dealerPoints.innerHTML = sumDealerPoints; //Mostrarlo en pantalla

    cardDealerId++;
}


function hitCard() {
    //Declaro "cardName = cardsDict[0][0]" y "cardValue = cardsDict[0][1]", que recojo del return de "getRandomCard", 
    //ya que me devuelve el pair key/value entero
    const [cardName, cardValue] = getRandomCard();

    //Creo un nuevo <li> con la <img> justo despues del ultimo hijo del <ul>
    playerDeck.insertAdjacentHTML("beforeend", `<li id='player-card-${cardPlayerId}'><img src='/imgs/cards/${cardName}.png' alt=''></li>`);

    let newPlayerCard = document.getElementById(`player-card-${cardPlayerId}`); //Es la nueva carta que he creado y añadido para el jugador a la lista.

    newPlayerCard.getBoundingClientRect(); //Esto fuerza a que el css aplique el translateY(0px) que le agregamos al elemento

    newPlayerCard.style.transform = "translateY(0px)";

    let currentPlayerPoints = parseInt(playerPoints.innerHTML); //Mis puntos actuales
    let sumPlayerPoints = currentPlayerPoints + cardValue; //Los puntos sumados de mis actuales + el valor de la carta que he sacado

    if (sumPlayerPoints >= 21) {
        hit.style.pointerEvents = "none"; //Para que si tengo 21 o si me he pasado, que no se puedan spamear las cartas
        stand.style.pointerEvents = "none";
        dealerPlays(); //Si me paso, automaticamente hace que el dealer juegue, para ver si gana el o estais empate
    }

    playerPoints.innerHTML = sumPlayerPoints; //Mostrarlo en pantalla

    cardPlayerId++;
}

function standCard() {
    dealerPlays();
}

//Esta funcion hace que el dealer, si sus puntos son menores o iguales que 16, saque otra carta
function dealerPlays() {
    //Con una funcion anidada no me hace falta hacer un bucle
    function draw() { 
        if (dealerPoints.innerHTML <= 16) { //Compruebo con los puntos del dealer (Tener en cuenta que "dealerPoints.innerHTML" es string)
            dealerStartRound();
            //Despues de un segundo, la vuelvo a llamar para que robe otra carta, y recorre todo el if entero, con eso consigo la validacion
            setTimeout(draw, 1000); 
        } else {
            decidesWinner();
        }
    }
    
    draw(); //Aqui llamo por primera vez a la funcion
    
}

function decidesWinner() {
    const dealerFinalPoints = parseInt(dealerPoints.innerHTML);
    const playerFinalPoints = parseInt(playerPoints.innerHTML);

    let winner; //Dato que mandaré al dialog para alli procesar el contenido
    //0 = Dealer || 1 = Jugador || 2 = Empate
    
    //Si alguno se pasa
    if (playerFinalPoints > 21 && dealerFinalPoints > 21) {
        winner = 2;
        winLoseScreen(winner);
        return;
    }
    if (playerFinalPoints > 21) {
        winner = 0;
        winLoseScreen(winner);
        return;
    }
    if (dealerFinalPoints > 21) {
        winner = 1;
        winLoseScreen(winner);
        return;
    }

    //Si ambos dentro de 0-21 → gana el más cercano a 21
    if (playerFinalPoints > dealerFinalPoints) {
        winner = 1;
        winLoseScreen(winner);
        return;
    } else {
        winner = 0;
        winLoseScreen(winner);
        return;
    }
}

function winLoseScreen(winner) {

    if (winner === 0) {
        winLoseText.innerHTML = `Has perdido bobolón <br> El dealer te la ha jugado (Esto esta amañado)`;
        moneyEarned.innerHTML = `Pierdes: ${"-moneyEarned"}`;
    } else if (winner === 1) {
        winLoseText.innerHTML = `¡Has ganado cabronazo <br> El dealer está llorando en una esquina!`;
        moneyEarned.innerHTML = `Ganas: ${"moneyEarned"}`;
    } else if (winner === 2) {
        winLoseText.innerHTML = `Que quieres que te diga <br> Al menos no has perdido ninguna pesata...`;
        winLoseText.innerHTML = "Empate";
    }

    winLoseDialog.showModal();
}

function restartRound() {

    cardsDict = Object.entries(cardsArray);

    winLoseDialog.requestClose();

    let dealerEraseDeck = document.querySelectorAll("#dealer-deck li");
    let playerEraseDeck = document.querySelectorAll("#player-deck li");

    for (let i = 0; i < dealerEraseDeck.length; i++) {
        console.log(dealerEraseDeck[i]);
        dealerEraseDeck[i].remove()
    }

    for (let i = 0; i < playerEraseDeck.length; i++) {
        console.log(playerEraseDeck[i]);
        playerEraseDeck[i].remove()
    }

    //Atualizamos los puntos a zero
    dealerPoints.innerHTML = 0;
    playerPoints.innerHTML = 0;

    //Llamamos a la funcion para que el dealer vuelva a empezar la ronda
    dealerStartRound();
}

"win-lose-dialog"
"dialog-header"
"dialog-body"
"win-lose-text"
"money-earned"
"again"

////////FUNCTIONS////////
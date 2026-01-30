import { cardsArray } from "./src/cardsObject.js";
import { randomWarningsArray } from "./src/randomWarnings";
import { getRanking } from "./src/appwrite.js";

let cardsDict = Object.entries(cardsArray);

for (let i = 0; i < cardsDict.length; i++) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = `/imgs/cards/${cardsDict[i][0]}.png`;
    document.head.appendChild(link);
}

function getRandomCard() {
    const randomCardIndex = Math.floor(Math.random() * cardsDict.length);

    const selectedCard = cardsDict.splice(randomCardIndex, 1)[0]; //Esto saca una carta random, y luego la elimina del objeto para que no vuelva a salir

    return selectedCard; //Esto me devuelve la carta entera, nombre + valor
}

window.addEventListener("load", () => {
    mostrarRanking();
    selectBet();
    //dealerStartRound();
    //playerStartRound();
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
let againButton = document.getElementById("again");
let moneyRound = document.getElementById("money-round");
let moneySlider = document.getElementById("money-slider");
let betMoney = document.getElementById("bet-money"); //Div que contiene todo para apostar(slider, dinero, input...)
let betAmount = document.getElementById("bet-amount");
let currentMoney = document.getElementById("current-money");
let exactBet = document.getElementById("exact-bet"); //El input para apostar el dinero justo
let betMoneySelected = document.getElementById("bet-money-selected"); //Boton para empezar la apuesta
let graphContainer = document.getElementById("graph-container"); //Div que contiene el grafico win|lose
let betWarning = document.getElementById("bet-warning"); //Frases aleatorias en la pantalla de apostar
let ranking = document.getElementById("ranking"); 
export let moneyArray = [];


////////FORM////////

let loginSignInForm = document.getElementById("login-sign-in-forms"); //Es el div de los dos forms
let login = document.getElementById("login"); //Es el form de login entero, usado de momento para acceder al boton con un addEventListener "submit"
let signIn = document.getElementById("sign-in");
let formsBorder = document.getElementById("forms-border");
let loginText = document.getElementById("login-text");
let signInText = document.getElementById("sign-in-text");


let changeToSignIn = document.getElementById("change-to-sign-in");
let changeToLogin = document.getElementById("change-to-login");

changeToSignIn.addEventListener("mouseup", function() {
    login.style.display = "none";
    loginText.style.opacity = "0";
    formsBorder.style.background = "linear-gradient(to left, #1b5928 50%, #ffffff 50%)"
    signIn.style.display = "flex"
    signInText.style.opacity = "1";
});

changeToLogin.addEventListener("mouseup", function() {
    signIn.style.display = "none";
    signInText.style.opacity = "0";
    formsBorder.style.background = "linear-gradient(to left, #ffffff 50%, #1b5928 50%)"
    login.style.display = "flex";
    loginText.style.opacity = "1";
})

////////FORM////////

////////VARIABLES////////



////////GLOBAL VARIABLES////////

let cardDealerId = 1; //Id que incrementara a medida que el dealer saque una carta
let cardPlayerId = 1; //Id que incrementara a medida que el jugador saque una carta
let sumPlayerPoints; //Puntos sumados del jugador
window.moneyEarned = window.moneyEarned || 100;
currentMoney.innerHTML = `Wallet: ${window.moneyEarned}€`; //El dinero que tengo
moneySlider.max = window.moneyEarned;
exactBet.max = window.moneyEarned;
let blacjackFirstHand = false; //Boolean que me servirá para saber si saco blackjack con la primera mano

//Arrays para guardar las cartas usadas por el dealer/player que se enviaran a calculatePoints()
let playerCards = [];
let dealerCards = [];

//Le añado una clase al body que oscurece al fondo, cuando le de al boton de apostar, le quitaré la clase
document.body.classList.add("darker");

////////GLOBAL VARIABLES////////



////////EVENTS////////

hit.addEventListener("mouseup", function() {
    hitCard();
    //Cuando tire una carta, le quito el pointerEvents para que no se pueda cambiar la apuesta una vez hayas tirado
    moneySlider.style.pointerEvents = "none";
});
stand.addEventListener("mouseup", standCard);

//Le quito los eventos y se los reactivo cuando le den al boton de comenzar
hit.style.pointerEvents = "none";
stand.style.pointerEvents = "none"

//El atributo "click" me permite usar tanto el click del raton como el ENTER para disparar el evento
againButton.addEventListener("click", restartRound);

//Evento para apostar con el dinero exacto seleccionado
exactBet.addEventListener("keyup", function(e) {
    if (e.key === "Enter") {
        betAmount.innerHTML = `${exactBet.value}€`;
        if (exactBet.value > window.moneyEarned) {
            betAmount.innerHTML = `${window.moneyEarned}€`
        }
    }
});

//Evento cuando le doy al boton de apostar
betMoneySelected.addEventListener("click", function() {
    betMoney.style.display = "none";
    betWarning.style.display = "none";
    graphContainer.style.display = "none";
    hit.style.pointerEvents = "all";
    stand.style.pointerEvents = "all";
    ranking.style.display = "none";

    //Aqui le quito la clase (fondo oscurecido)
    document.body.classList.remove("darker");

    dealerStartRound();
    playerStartRound();
});

let isDragging = false; //Boolean para comprobar si la sliding bar esta siendo pulsado, y poder usar el listener de "mousemove"


////////EVENTS////////


////////LOGIC////////

let randomWarningsIndex = Math.floor(Math.random() * randomWarningsArray.length); //Index aleatorio para una frase del array de warnings
betWarning.innerHTML = randomWarningsArray[randomWarningsIndex];

////////LOGIC////////



////////FUNCTIONS////////

async function mostrarRanking() {
    const usuarios = await getRanking();
    const rankingList = document.getElementById('ranking-list');
    
    if (usuarios.length === 0) {
        rankingList.innerHTML = '<p>No hay usuarios en el ranking</p>';
        return;
    }
    
    rankingList.innerHTML = usuarios.map((usuario, index) => `
        <div class="ranking-item">
            <span class="position">${index + 1}.</span>
            <span class="username">${usuario.username}</span>
            <span class="wallet">${usuario.wallet}€</span>
        </div>
    `).join('');
}

function selectBet() {

    moneySlider.addEventListener('mousedown', function() {
        isDragging = true;
    });

    //Si "isDragging" es true, se activa lo que diga el listener que lo deberia de ser porque lo es cuando mantengo el click por el anterior listener
    moneySlider.addEventListener('mousemove', function() {
        if (isDragging) {
            betAmount.innerHTML = `${moneySlider.value}€`;
        }
    });

    moneySlider.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
        }
    });
}
// ADDS DATA FOR GRAPH
function addDataGraph(value){
    moneyArray.push({
        mano: moneyArray.length,
        dinero: value
    });
}

function calculatePoints(cards) {
    //Sumo el valor de todas las cartas (tratando los ases inicialmente como 11)
    let total = cards.reduce((acc, card) => acc + card.value, 0);

    //Cuento cuántos ases están valiendo 11 actualmente
    let aces = cards.filter(card => card.value === 11).length;

    //Si me paso de 21 y tengo ases que puedo convertir a 1, los ajusto uno por uno
    while (total > 21 && aces > 0) {
        total -= 10; //Convertir un As de 11 a 1 equivale a restar 10 puntos
        aces--;      //Marco que ya ajusté un As para no convertirlo dos veces
    }

    //Devuelvo la suma final ajustada según las reglas del Blackjack
    return total;
}

function dealerStartRound() {
    //Declaro "cardName = cardsDict[0][0]" y "cardValue = cardsDict[0][1]", que recojo del return de "getRandomCard", 
    //ya que me devuelve el pair key/value entero
    const [cardName, cardValue] = getRandomCard();
    
    ///////DEALER SACA UNA CARTA(AUNQ SON 2)///////

    //Creo un nuevo <li> con la <img> justo despues del ultimo hijo del <ul>
    dealerDeck.insertAdjacentHTML("beforeend", `<li id='dealer-card-${cardDealerId}'><img src='/imgs/cards/${cardName}.png' alt=''></li>`);

    let newDealerCard = document.getElementById(`dealer-card-${cardDealerId}`); //Es la nueva carta que he creado y añadido para el dealer a la lista.

    newDealerCard.getBoundingClientRect(); //Esto fuerza a que el css aplique el translateY(0px) que le agregamos al elemento

    newDealerCard.style.transform = "translateY(0px)";

    let currentDealerPoints = parseInt(dealerPoints.innerHTML); //Puntos actuales del dealer

    //Guardo la carta del dealer en su array de cartas
    dealerCards.push({ name: cardName, value: cardValue });

    //Recalculo los puntos del dealer (ajustando ases automáticamente si es necesario)
    let sumDealerPoints = calculatePoints(dealerCards);

    dealerPoints.innerHTML = sumDealerPoints; //Mostrarlo en pantalla

    dealerPoints.classList.add("get-points-animation"); //Animacion para los puntos

    setTimeout(() => {
        dealerPoints.classList.remove("get-points-animation"); //A los 3 ms se quita la animacion, para que si vuelves a tirar se añada
    }, 300);

    cardDealerId++;

    ///////DEALER SACA UNA CARTA(AUNQ SON 2)///////
}

/////////ES UNA FUNCION PARA QUE EL JUGADOR AL PRINCIPIO DE CADA RONDA SAQUE 2 CARTAS/////////

function playerStartRound() {
    for (let i = 0; i < 2; i++) {
        hitCard();
    }
    if (sumPlayerPoints === 21) { //Si saco 21 de primeras, automaticamente hace que el dealer juegue, para ver si estamos empate
        hit.style.pointerEvents = "none"; //Para que si tengo 21 o si me he pasado, que no se puedan spamear las cartas
        stand.style.pointerEvents = "none";
        blacjackFirstHand = true;
        dealerPlays(); 
        
    }

}

/////////ES UNA FUNCION PARA QUE EL JUGADOR AL PRINCIPIO DE CADA RONDA SAQUE 2 CARTAS/////////

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

    //Guardo la carta del player en su array de cartas
    playerCards.push({ name: cardName, value: cardValue });

    //Recalculo los puntos del player (ajustando ases automáticamente si es necesario)
    sumPlayerPoints = calculatePoints(playerCards);

    if (sumPlayerPoints === 21) {
        hit.style.pointerEvents = "none"; //Para que si tengo 21 o si me he pasado, que no se puedan spamear las cartas
        stand.style.pointerEvents = "none";
        dealerPlays(); //Si me paso, automaticamente hace que el dealer juegue, para ver si gana el o estais empate
    }

    playerPoints.innerHTML = sumPlayerPoints; //Mostrarlo en pantalla

    playerPoints.classList.add("get-points-animation"); //Animacion para los puntos

    if (parseInt(playerPoints.innerHTML) > 21) {
        hit.style.pointerEvents = "none";
        stand.style.pointerEvents = "none";
        decidesWinner();
    }

    setTimeout(() => {
        playerPoints.classList.remove("get-points-animation"); //A los 3 ms se quita la animacion, para que si vuelves a tirar se añada
    }, 300);

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
    if (playerFinalPoints === dealerFinalPoints) {
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
    let calcMoney; //Variable para calcular el dinero
    let moneyEarnedFromBet = betAmount.innerHTML; //El dinero que gané/perdí por la apuesta
    moneyEarnedFromBet = parseInt(moneyEarnedFromBet); //Lo convierto a int para las operaciones

    if (winner === 0) {
        calcMoney = window.moneyEarned - moneyEarnedFromBet;  

        currentMoney.innerHTML = `Wallet: ${calcMoney}€`; //El dinero que tenia restado por lo que aposté
        window.moneyEarned = calcMoney; //Actualizo mi dinero maximo
        moneySlider.max = window.moneyEarned; //Actualizo el max del slider
        exactBet.max = window.moneyEarned; //Actualizo el max del input para el dinero exacto
        
        //ACTUALIZAR EN LA BASE DE DATOS
        if (window.updateWalletInDB) {
            window.updateWalletInDB(window.moneyEarned);
            addDataGraph(window.moneyEarned); // Agrega el dinero para el grafico
        }

        winLoseText.innerHTML = `Has perdido bobolón <br> El dealer te la ha jugado (Esto esta amañado)`;
        moneyRound.innerHTML = `Pierdes: -${moneyEarnedFromBet}`;

    } else if (winner === 1) {
        if (blacjackFirstHand === false) {
            calcMoney = (window.moneyEarned + (moneyEarnedFromBet * 2) / 2);
        } else {
            calcMoney = window.moneyEarned + ((moneyEarnedFromBet * 2 /*1.5*/) / 2); // Recuperas apuesta + ganas 1.5x, esta comentado porq no funciona bien
        }
        

        currentMoney.innerHTML = `Wallet: ${calcMoney}€`; //El dinero que tenia duplicado por haber ganado
        window.moneyEarned = calcMoney; //Actualizo mi dinero maximo
        moneySlider.max = window.moneyEarned; //Actualizo el max del slider
        exactBet.max = window.moneyEarned; //Actualizo el max del input para el dinero exacto

        //ACTUALIZAR EN LA BASE DE DATOS
        if (window.updateWalletInDB) {
            window.updateWalletInDB(window.moneyEarned);
            addDataGraph(window.moneyEarned); // Agrega el dinero para el grafico
        }

        winLoseText.innerHTML = `¡Has ganado cabronazo <br> El dealer está llorando en una esquina!`;

        //Debo de hacer otra operacion, ya que el dinero ganado es el dinero apostado * 2 pero sin mi dinero actual
        calcMoney = moneyEarnedFromBet * 2;

        moneyRound.innerHTML = `Ganas: ${calcMoney}`;

    } else if (winner === 2) {
        //En empate, el jugador recupera su apuesta
        calcMoney = window.moneyEarned; //El dinero se mantiene igual

        currentMoney.innerHTML = `Wallet: ${calcMoney}€`;
        window.moneyEarned = calcMoney;
        moneySlider.max = window.moneyEarned;

        //ACTUALIZAR EN LA BASE DE DATOS
        if (window.updateWalletInDB) {
            window.updateWalletInDB(window.moneyEarned);
            addDataGraph(window.moneyEarned); // Agrega el dinero para el grafico
        }

        winLoseText.innerHTML = `¡Empate! <br> Recuperas tu apuesta`;
        moneyRound.innerHTML = `Empate: ±0€`;
    }

    /////MONEY LOOSE LOGIC/////

    //Si la cantidad apostada (texto verde donde decides cuanto apostar) al final es mayor que la cantidad en la wallet, que se actualice al dinero
    //actual de la wallet
    if (moneyEarnedFromBet > window.moneyEarned) {
        betAmount.innerHTML = `${window.moneyEarned}€`;
    }

    /////MONEY LOOSE LOGIC/////

    winLoseDialog.showModal();
}

function restartRound() {

    cardsDict = Object.entries(cardsArray);

    randomWarningsIndex = Math.floor(Math.random() * randomWarningsArray.length); //Volver a llamar al randomIndex
    betWarning.innerHTML = randomWarningsArray[randomWarningsIndex];

    winLoseDialog.requestClose();

    let dealerEraseDeck = document.querySelectorAll("#dealer-deck li");
    let playerEraseDeck = document.querySelectorAll("#player-deck li");

    for (let i = 0; i < dealerEraseDeck.length; i++) {
        dealerEraseDeck[i].remove()
    }

    for (let i = 0; i < playerEraseDeck.length; i++) {
        playerEraseDeck[i].remove()
    }

    //Atualizamos los puntos a zero
    dealerPoints.innerHTML = 0;
    playerPoints.innerHTML = 0;

    //Vacio los arrays que guardan las cartas de las manos jugadas
    playerCards = [];
    dealerCards = [];

    //Rehabilito los eventos
    hit.style.pointerEvents = "all";
    stand.style.pointerEvents = "all";
    moneySlider.style.pointerEvents = "all";

    //Le añado una clase al body que oscurece al fondo, cuando le de al boton de apostar, le quitaré la clase
    document.body.classList.add("darker");

    betMoney.style.display = "flex";
    betWarning.style.display = "block";
    graphContainer.style.display = "block";
    ranking.style.display = "flex";

    blacjackFirstHand = false;
    
    selectBet();
}

////////FUNCTIONS////////
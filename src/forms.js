import { registerUser, loginUser, updateUserWallet, getUserData } from './appwrite.js';

// Variable global para el usuario actual
let currentUser = null;

// Manejar el formulario de SIGN IN (Registro)
document.getElementById('sign-in').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('sign-in-username').value.trim();
    const password = document.getElementById('sign-in-password').value;

    if (!username || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    const result = await registerUser(username, password);

    if (result.success) {
        alert('¡Registro exitoso! Ahora puedes hacer login');
        document.getElementById('sign-in-username').value = '';
        document.getElementById('sign-in-password').value = '';
        document.getElementById('change-to-login').click();
    } else {
        alert('Error: ' + result.error);
    }
});

// Manejar el formulario de LOGIN
document.getElementById('login').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    const result = await loginUser(username, password);

    if (result.success) {
        currentUser = result.user; // Guardar usuario actual
        
        // Guardar en sessionStorage
        sessionStorage.setItem('sesionIniciada', 'true');
        sessionStorage.setItem('userId', currentUser.$id);
        sessionStorage.setItem('username', currentUser.username);
        
        // Cargar el dinero del usuario desde la BD
        const userData = await getUserData(currentUser.$id);
        if (userData.success) {
            // Actualizar la variable global del juego
            window.moneyEarned = userData.user.wallet;
            document.getElementById('current-money').innerHTML = `Wallet: ${window.moneyEarned}€`;
            document.getElementById('money-slider').max = window.moneyEarned;
            document.getElementById('exact-bet').max = window.moneyEarned;
        }
        
        //Si el resultado es success (el usuario logeado existe) se ocultan los forms y se muestra la pantalla de apuesta
        document.getElementById('login-sign-in-forms').style.display = 'none';
        
        const betMoney = document.getElementById('bet-money');
        betMoney.style.display = 'flex';
        
        alert('¡Bienvenido ' + currentUser.username + '!');
    } else {
        alert('Error: ' + result.error);
    }
});

// Exportar función para actualizar wallet desde el juego
window.updateWalletInDB = async function(newAmount) {
    if (!currentUser) {
        const userId = sessionStorage.getItem('userId');
        if (!userId) return;
        
        const result = await updateUserWallet(userId, newAmount);
        if (result.success) {
            console.log('💰 Wallet actualizado en la BD:', newAmount);
        }
    } else {
        const result = await updateUserWallet(currentUser.$id, newAmount);
        if (result.success) {
            console.log('💰 Wallet actualizado en la BD:', newAmount);
        }
    }
};

// Al cargar la página, verificar si hay sesión activa
window.addEventListener('DOMContentLoaded', async function() {
    if (sessionStorage.getItem('sesionIniciada') === 'true') {
        const userId = sessionStorage.getItem('userId');
        
        if (userId) {
            // Cargar datos del usuario
            const userData = await getUserData(userId);
            if (userData.success) {
                currentUser = userData.user;
                
                // Actualizar dinero del juego
                window.moneyEarned = userData.user.wallet;
                document.getElementById('current-money').innerHTML = `Wallet: ${window.moneyEarned}€`;
                document.getElementById('money-slider').max = window.moneyEarned;
                document.getElementById('exact-bet').max = window.moneyEarned;
            }
        }
        
        document.getElementById('login-sign-in-forms').style.display = 'none';
        document.getElementById('bet-money').style.display = 'flex';
    }
});
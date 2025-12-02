import { Client, Databases, Account, Storage, Query } from 'appwrite';

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);

const DATABASE_ID = '692f4f810019fcf4c421';
const TABLE_ID = 'users';

// Función para registrar un nuevo usuario
export async function registerUser(username, password) {
    try {
        // Verificar si el usuario ya existe usando Query
        const existingUsers = await databases.listDocuments(
            DATABASE_ID,
            TABLE_ID,
            [Query.equal('username', username)] // ✅ Usar Query.equal()
        );

        if (existingUsers.documents.length > 0) {
            throw new Error('El usuario ya existe');
        }

        // Crear el nuevo usuario
        const response = await databases.createDocument(
            DATABASE_ID,
            TABLE_ID,
            'unique()',
            {
                username: username,
                passwordHash: password,
                wallet: 100,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            }
        );
        
        console.log('Usuario registrado:', response);
        return { success: true, user: response };
    } catch (error) {
        console.error('Error al registrar:', error);
        return { success: false, error: error.message };
    }
}

// Función para hacer login
export async function loginUser(username, password) {
    try {
        // Buscar usuario usando Query
        const response = await databases.listDocuments(
            DATABASE_ID,
            TABLE_ID,
            [Query.equal('username', username)] // ✅ Usar Query.equal()
        );

        if (response.documents.length === 0) {
            throw new Error('Usuario no encontrado');
        }

        const user = response.documents[0];

        if (user.passwordHash !== password) {
            throw new Error('Contraseña incorrecta');
        }

        // Actualizar último login
        await databases.updateDocument(
            DATABASE_ID,
            TABLE_ID,
            user.$id,
            {
                lastLogin: new Date().toISOString()
            }
        );

        console.log('Login exitoso:', user);
        return { success: true, user: user };
    } catch (error) {
        console.error('Error al hacer login:', error);
        return { success: false, error: error.message };
    }
}

// Función para actualizar el wallet
export async function updateUserWallet(userId, newAmount) {
    try {
        const response = await databases.updateDocument(
            DATABASE_ID,
            TABLE_ID,
            userId,
            {
                wallet: newAmount
            }
        );
        console.log('Wallet actualizado:', response);
        return { success: true, wallet: response.wallet };
    } catch (error) {
        console.error('Error al actualizar wallet:', error);
        return { success: false, error: error.message };
    }
}

// Función para obtener datos del usuario
export async function getUserData(userId) {
    try {
        const response = await databases.getDocument(
            DATABASE_ID,
            TABLE_ID,
            userId
        );
        return { success: true, user: response };
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return { success: false, error: error.message };
    }
}

export default client;
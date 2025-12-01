const { Pool } = require('pg');
require('dotenv').config();

// Configuración de PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Inicializa la base de datos y crea tablas si no existen
 */
async function initDatabase() {
    try {
        console.log('🔧 Inicializando base de datos...');
        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS player_cache (
                id SERIAL PRIMARY KEY,
                player_name VARCHAR(255) UNIQUE NOT NULL,
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_player_name ON player_cache(player_name);
            CREATE INDEX IF NOT EXISTS idx_updated_at ON player_cache(updated_at);
        `;

        await pool.query(createTableQuery);
        console.log('✅ Base de datos inicializada');
        
    } catch (error) {
        console.error('❌ Error inicializando BD:', error);
        throw error;
    }
}

/**
 * Obtiene datos del cache si existen y no han expirado (< 1 hora)
 * @param {string} playerName 
 * @returns {Promise<Object|null>}
 */
async function getPlayerCache(playerName) {
    try {
        const query = `
            SELECT data, updated_at 
            FROM player_cache 
            WHERE player_name = $1 
            AND updated_at > NOW() - INTERVAL '1 hour'
        `;
        
        const result = await pool.query(query, [playerName.toLowerCase()]);
        
        if (result.rows.length > 0) {
            console.log(`📦 Cache hit para ${playerName}`);
            return result.rows[0].data;
        }
        
        console.log(`📭 Cache miss para ${playerName}`);
        return null;
        
    } catch (error) {
        console.error('❌ Error leyendo cache:', error);
        return null;
    }
}

/**
 * Guarda o actualiza datos en el cache
 * @param {string} playerName 
 * @param {Object} data 
 */
async function savePlayerCache(playerName, data) {
    try {
        const query = `
            INSERT INTO player_cache (player_name, data, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (player_name) 
            DO UPDATE SET 
                data = $2,
                updated_at = CURRENT_TIMESTAMP
        `;
        
        await pool.query(query, [playerName.toLowerCase(), JSON.stringify(data)]);
        console.log(`💾 Cache guardado para ${playerName}`);
        
    } catch (error) {
        console.error('❌ Error guardando cache:', error);
    }
}

/**
 * Limpia registros antiguos (> 24 horas)
 */
async function cleanOldCache() {
    try {
        const query = `
            DELETE FROM player_cache 
            WHERE updated_at < NOW() - INTERVAL '24 hours'
        `;
        
        const result = await pool.query(query);
        console.log(`🧹 Cache limpiado: ${result.rowCount} registros eliminados`);
        
    } catch (error) {
        console.error('❌ Error limpiando cache:', error);
    }
}

// Limpiar cache viejo cada 6 horas
setInterval(cleanOldCache, 6 * 60 * 60 * 1000);

module.exports = {
    initDatabase,
    getPlayerCache,
    savePlayerCache,
    cleanOldCache
};

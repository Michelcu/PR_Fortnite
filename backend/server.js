const express = require('express');
const cors = require('cors');
const { scrapePlayerEvents } = require('./scraper');
// const { initDatabase, getPlayerCache, savePlayerCache } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Cache en memoria temporal (sin BD)
const memoryCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora

console.log('⚠️  Ejecutando en modo sin base de datos (cache en memoria)');

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar base de datos al arrancar
// initDatabase().catch(err => console.error('❌ Error inicializando BD:', err));

// Health check para Railway
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date(),
        service: 'Fortnite Tracker Scraper'
    });
});

// Endpoint principal: buscar jugador y sus torneos
app.get('/api/player/:playerName', async (req, res) => {
    try {
        const playerName = decodeURIComponent(req.params.playerName);
        console.log(`🔍 Buscando jugador: ${playerName}`);

        // Verificar cache en memoria
        const cacheKey = playerName.toLowerCase();
        const cached = memoryCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
            console.log('✅ Datos en cache (memoria)');
            return res.json(cached.data);
        }

        // Hacer scraping
        console.log('🌐 Scraping FortniteTracker...');
        const data = await scrapePlayerEvents(playerName);

        if (!data || data.tournaments.length === 0) {
            return res.status(404).json({ 
                error: 'Jugador no encontrado o sin torneos' 
            });
        }

        // Guardar en cache de memoria
        memoryCache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });

        res.json(data);

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ 
            error: error.message,
            details: 'Error al procesar la solicitud'
        });
    }
});

// Endpoint para limpiar cache (opcional)
app.delete('/api/cache/:playerName', async (req, res) => {
    try {
        const playerName = decodeURIComponent(req.params.playerName);
        // Implementar función de limpieza si es necesario
        res.json({ message: 'Cache limpiado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🎮 API: http://localhost:${PORT}/api/player/:playerName`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled rejection:', error);
});

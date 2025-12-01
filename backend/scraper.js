const puppeteer = require('puppeteer');

/**
 * Hace scraping de la página de eventos de FortniteTracker
 * @param {string} playerName - Nombre del jugador
 * @returns {Promise<Object>} Datos del jugador y sus torneos
 */
async function scrapePlayerEvents(playerName) {
    let browser;
    
    try {
        console.log(`🌐 Iniciando navegador para ${playerName}...`);
        
        // Buscar ejecutable de Chromium
        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
            require('child_process').execSync('which chromium').toString().trim() ||
            undefined;
        
        // Configuración de Puppeteer
        browser = await puppeteer.launch({
            headless: 'new',
            executablePath: executablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-software-rasterizer',
                '--disable-extensions'
            ]
        });

        const page = await browser.newPage();
        
        // User agent para evitar detección
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        // URL de eventos del jugador
        const url = `https://fortnitetracker.com/profile/all/${encodeURIComponent(playerName)}/events`;
        console.log(`📄 Navegando a: ${url}`);
        
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        // Esperar a que cargue la tabla de eventos
        await page.waitForSelector('.trn-table', { timeout: 10000 });

        // Extraer datos de la página
        const data = await page.evaluate(() => {
            const tournaments = [];
            
            // Seleccionar todas las filas de torneos
            const rows = document.querySelectorAll('.trn-table tbody tr');
            
            rows.forEach((row, index) => {
                try {
                    const cells = row.querySelectorAll('td');
                    
                    // Log para debug (solo primera fila)
                    if (index === 0) {
                        console.log('📊 DEBUG - Total columnas:', cells.length);
                        cells.forEach((cell, i) => {
                            console.log(`  Columna ${i}: "${cell.innerText?.trim().substring(0, 50)}"`);
                        });
                    }
                    
                    if (cells.length >= 7) {
                        const tournament = {
                            event: cells[0]?.innerText?.trim() || 'N/A',
                            place: cells[1]?.innerText?.trim() || 'N/A',
                            prPoints: cells[2]?.innerText?.trim() || '0',
                            earnings: cells[3]?.innerText?.trim() || '$0',
                            // cells[4] = Teams (lo omitimos)
                            wins: cells[5]?.innerText?.trim() || '0',
                            elims: cells[6]?.innerText?.trim() || '0',
                            kd: cells[7]?.innerText?.trim() || '0.00'
                        };
                        
                        tournaments.push(tournament);
                    }
                } catch (err) {
                    console.error('Error parseando fila:', err);
                }
            });

            return {
                playerName: document.querySelector('h1')?.innerText?.trim() || 'Unknown',
                tournaments: tournaments.slice(0, 20) // Límite de 20 torneos
            };
        });

        console.log(`✅ Scraping completado: ${data.tournaments.length} torneos encontrados`);
        
        return data;

    } catch (error) {
        console.error('❌ Error en scraping:', error.message);
        throw new Error(`Error scraping FortniteTracker: ${error.message}`);
        
    } finally {
        if (browser) {
            await browser.close();
            console.log('🔒 Navegador cerrado');
        }
    }
}

module.exports = { scrapePlayerEvents };

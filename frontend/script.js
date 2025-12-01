// Backend API URL - cambiar según entorno
const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000' 
    : 'https://tu-app.railway.app'; // Cambiar después del deploy en Railway

const playerNameInput = document.getElementById('playerName');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const resultsDiv = document.getElementById('results');
const tournamentsDiv = document.getElementById('tournaments');

// Buscar al presionar el botón
searchBtn.addEventListener('click', searchPlayer);

// Buscar al presionar Enter
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchPlayer();
    }
});

async function searchPlayer() {
    const input = playerNameInput.value.trim();
    
    if (!input) {
        showError('Por favor, introduce un nombre de jugador o URL');
        return;
    }

    loading.classList.add('show');
    loading.textContent = 'Buscando jugador y torneos...';
    resultsDiv.innerHTML = '';
    tournamentsDiv.innerHTML = '';
    searchBtn.disabled = true;

    try {
        let playerName = input;
        
        // Si es URL de FortniteTracker, extraer nombre
        if (input.includes('fortnitetracker.com')) {
            const match = input.match(/profile\/[^\/]+\/([^\/\?]+)/);
            if (match) {
                playerName = decodeURIComponent(match[1]);
            } else {
                throw new Error('URL no válida');
            }
        }

        console.log(`🔍 Buscando: ${playerName}`);

        // Llamar al backend para obtener datos del jugador y torneos
        const response = await fetch(`${BACKEND_URL}/api/player/${encodeURIComponent(playerName)}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Jugador no encontrado');
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log('✅ Datos recibidos:', data);
        
        loading.classList.remove('show');
        searchBtn.disabled = false;

        displayResults(data);

    } catch (error) {
        loading.classList.remove('show');
        searchBtn.disabled = false;
        showError(`Error: ${error.message}`);
        console.error('❌ Error:', error);
    }
}

function displayResults(data) {
    // Mostrar información del jugador
    resultsDiv.innerHTML = `
        <div class="result-item">
            <div class="account-name">✓ ${data.playerName}</div>
            <div class="account-id">Total torneos: ${data.tournaments ? data.tournaments.length : 0}</div>
        </div>
    `;

    // Mostrar torneos
    if (data.tournaments && data.tournaments.length > 0) {
        displayTournaments(data.tournaments, data.playerName);
    } else {
        tournamentsDiv.innerHTML = '<div class="no-results">No se encontraron torneos para este jugador</div>';
    }
}

function displayTournaments(tournaments, playerName) {
    let html = `
        <h2>Últimos ${tournaments.length} Torneos de ${playerName}</h2>
        <table class="tournaments-table">
            <thead>
                <tr>
                    <th>Evento</th>
                    <th>Pos.</th>
                    <th>Ganancias</th>
                    <th>PR Points</th>
                    <th>Vict.</th>
                    <th>Elims</th>
                    <th>K/D</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    tournaments.forEach((tournament) => {
        // Limpiar valores numéricos y eliminar textos no deseados
        const wins = (tournament.wins || '0').toString().replace(/view all/gi, '').trim();
        const prPoints = (tournament.prPoints || '0').toString().replace(/[^0-9]/g, '');
        const elims = (tournament.elims || '0').toString().replace(/[^0-9]/g, '');
        const kd = (tournament.kd || '0.00').toString().replace(/[^0-9.]/g, '');
        const earnings = tournament.earnings || '$0';
        
        html += `
            <tr>
                <td class="event-name">${tournament.event || 'Sin nombre'}</td>
                <td class="center">${tournament.place || 'N/A'}</td>
                <td class="center">${earnings}</td>
                <td class="center">${prPoints}</td>
                <td class="center">${wins}</td>
                <td class="center">${elims}</td>
                <td class="center">${kd}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    tournamentsDiv.innerHTML = html;
}

function showError(message) {
    resultsDiv.innerHTML = `<div class="error">${message}</div>`;
}

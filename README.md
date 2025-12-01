# 🎮 Fortnite Player Tournament Tracker

Aplicación web para buscar jugadores de Fortnite y ver sus resultados en torneos mediante scraping de FortniteTracker.

## 📋 Características

- ✅ Búsqueda de jugadores por nombre o URL de FortniteTracker
- ✅ Scraping automático de datos de torneos
- ✅ Cache en PostgreSQL para consultas rápidas
- ✅ Desplegable en Railway
- ✅ Frontend responsive con diseño moderno

## 🏗️ Arquitectura

```
Frontend (HTML/CSS/JS) → Backend (Node.js + Express) → FortniteTracker (Puppeteer) → PostgreSQL
```

## 📁 Estructura del Proyecto

```
Pruebas_Buscador_FortniteAPIio/
├── frontend/
│   ├── index.html          # Interfaz web
│   ├── styles.css          # Estilos
│   └── script.js           # Lógica frontend
├── backend/
│   ├── server.js           # API REST con Express
│   ├── scraper.js          # Scraping con Puppeteer
│   ├── database.js         # Conexión PostgreSQL
│   ├── package.json        # Dependencias
│   ├── Dockerfile          # Para Railway
│   └── .env.example        # Variables de entorno
├── railway.json            # Configuración Railway
└── README.md               # Este archivo
```

## 🚀 Setup Local

### Prerrequisitos

- Node.js 18+ instalado
- PostgreSQL instalado (o usar Railway)

### Instalación

1. **Clonar el repositorio**
```bash
cd "c:\Proyectos VScode\Pruebas_Buscador_FortniteAPIio"
```

2. **Instalar dependencias del backend**
```bash
cd backend
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en `backend/`:
```env
PORT=3000
DATABASE_URL=postgresql://usuario:password@localhost:5432/fortnite_db
NODE_ENV=development
```

4. **Crear base de datos PostgreSQL**

La base de datos se creará automáticamente al iniciar el servidor.

5. **Iniciar el servidor**
```bash
npm start
```

El backend estará corriendo en `http://localhost:3000`

6. **Abrir el frontend**

Abre `frontend/index.html` en tu navegador o usa Live Server en VS Code.

## 🌐 Deploy en Railway

### 1. Preparar el proyecto

Asegúrate de tener un repositorio Git:
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Crea un nuevo proyecto
3. Conecta tu repositorio de GitHub

### 3. Agregar PostgreSQL

1. En Railway, haz clic en "+ New"
2. Selecciona "Database" → "PostgreSQL"
3. Railway generará automáticamente `DATABASE_URL`

### 4. Configurar variables de entorno

En Settings → Variables, agrega:
```
NODE_ENV=production
```

### 5. Desplegar

Railway detectará automáticamente el `Dockerfile` y desplegará el backend.

### 6. Actualizar frontend

En `frontend/script.js`, cambia la URL del backend:
```javascript
const BACKEND_URL = 'https://tu-app.railway.app';
```

### 7. Desplegar frontend

Puedes usar:
- **Vercel** (recomendado): `npx vercel deploy frontend/`
- **Netlify**: Arrastra la carpeta `frontend/`
- **Railway**: Crear otro servicio para el frontend

## 🔧 Endpoints de la API

### `GET /api/player/:playerName`

Obtiene información del jugador y sus torneos.

**Ejemplo:**
```
GET http://localhost:3000/api/player/KPI%20Rizquez
```

**Respuesta:**
```json
{
  "playerName": "KPI Rizquez",
  "tournaments": [
    {
      "event": "Solo Series Victory Cash Cup",
      "date": "Nov 24, 2025",
      "place": "189",
      "earnings": "0",
      "matches": "5",
      "wins": "0",
      "elims": "3",
      "kd": "1.67"
    }
  ],
  "cached": false,
  "timestamp": "2025-12-01T12:00:00.000Z"
}
```

### `GET /health`

Health check para Railway.

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **Puppeteer** - Scraping de FortniteTracker
- **PostgreSQL** - Base de datos
- **pg** - Cliente PostgreSQL
- **dotenv** - Variables de entorno
- **cors** - CORS middleware

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos
- **JavaScript** - Lógica

### DevOps
- **Docker** - Containerización
- **Railway** - Hosting y despliegue

## 📊 Base de Datos

### Tabla: `player_cache`

```sql
CREATE TABLE IF NOT EXISTS player_cache (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(255) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_player_name ON player_cache(player_name);
CREATE INDEX idx_updated_at ON player_cache(updated_at);
```

**Cache duration**: 1 hora

## 🐛 Troubleshooting

### Error: "Cannot find module 'puppeteer'"
```bash
cd backend
npm install
```

### Error: "Port 3000 already in use"
Cambiar el puerto en `.env`:
```env
PORT=3001
```

### Puppeteer no funciona en Railway
El `Dockerfile` incluye las dependencias necesarias de Chromium.

### Frontend no se conecta al backend
Verifica que `BACKEND_URL` en `script.js` apunte a la URL correcta.

## 📝 Notas

- El scraping puede tardar 5-15 segundos dependiendo de la cantidad de torneos
- Los datos se cachean durante 1 hora para mejorar el rendimiento
- Railway puede poner el servicio en "sleep" después de inactividad (plan gratuito)

## 📄 Licencia

Este proyecto es de uso personal y educativo.

## 👤 Autor

Desarrollado para rastrear resultados de torneos de Fortnite.

---

**🎯 ¿Necesitas ayuda?** Abre un issue en el repositorio.

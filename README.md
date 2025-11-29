# Calendario Visual

Aplicación web de calendario interactivo para gestionar eventos con interfaz visual intuitiva.

## Características

- Visualización de calendario mensual interactivo
- Creación, edición y eliminación de eventos
- Tipos de eventos: recordatorio, reunión, tarea y festivo
- Almacenamiento persistente en base de datos SQLite
- Interfaz responsiva y fácil de usar

## Tecnologías

- **Backend**: Node.js con Express
- **Base de datos**: SQLite3
- **Frontend**: HTML, CSS, JavaScript
- **Librería de calendario**: FullCalendar 6.1.8

## Requisitos previos

- Node.js (versión 12 o superior)
- npm (incluido con Node.js)

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd Calendario
```

2. Instalar dependencias:
```bash
npm install
```

## Uso

1. Iniciar el servidor:
```bash
npm start
```

2. Abrir el navegador en:
```
http://localhost:3000
```

## Funcionalidades

### Crear evento
- Haz clic en cualquier día del calendario
- Completa el formulario con título, hora, tipo y descripción
- Haz clic en "Guardar"

### Editar evento
- Haz clic en un evento existente
- Modifica los campos deseados
- Haz clic en "Guardar cambios"

### Eliminar evento
- Haz clic en un evento
- Haz clic en "Eliminar evento"

### Ver todos los eventos
- Haz clic en el botón "Ver todos los eventos" en la parte inferior

## Estructura del proyecto

```
Calendario/
├── public/
│   ├── calendar.js      # Lógica del calendario
│   ├── index.html       # Página principal
│   └── styles.css       # Estilos
├── database.db          # Base de datos SQLite
├── server.js            # Servidor Express
├── package.json         # Configuración y dependencias
└── README.md
```

## API Endpoints

- `GET /` - Página principal
- `GET /eventos` - Obtener todos los eventos
- `POST /eventos` - Crear nuevo evento
- `PUT /eventos/:id` - Actualizar evento
- `DELETE /eventos/:id` - Eliminar evento

## Licencia

ISC

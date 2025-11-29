# Visual Calendar

Interactive web calendar application for managing events with an intuitive visual interface.

## Features

- Interactive monthly calendar visualization
- Create, edit, and delete events
- Event types: reminder, meeting, task, and holiday
- Persistent storage with SQLite database
- Responsive and user-friendly interface

## Technologies

- **Backend**: Node.js with Express
- **Database**: SQLite3
- **Frontend**: HTML, CSS, JavaScript
- **Calendar library**: FullCalendar 6.1.8

## Prerequisites

- Node.js (version 12 or higher)
- npm (included with Node.js)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Calendario
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser at:
```
http://localhost:3000
```

## Functionalities

### Create event
- Click on any day in the calendar
- Fill out the form with title, time, type, and description
- Click "Save"

### Edit event
- Click on an existing event
- Modify the desired fields
- Click "Save changes"

### Delete event
- Click on an event
- Click "Delete event"

### View all events
- Click the "View all events" button at the bottom

## Project structure

```
Calendario/
├── public/
│   ├── calendar.js      # Calendar logic
│   ├── index.html       # Main page
│   └── styles.css       # Styles
├── database.db          # SQLite database
├── server.js            # Express server
├── package.json         # Configuration and dependencies
└── README.md
```

## API Endpoints

- `GET /` - Main page
- `GET /eventos` - Get all events
- `POST /eventos` - Create new event
- `PUT /eventos/:id` - Update event
- `DELETE /eventos/:id` - Delete event

## License

ISC

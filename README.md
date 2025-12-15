# Visual Calendar

Interactive web calendar application for managing events with an intuitive visual interface.

## Features

- Interactive monthly calendar visualization
- Create, edit, and delete events
- Event types: reminder, meeting, task, and holiday
- **Microsoft Teams/Outlook calendar integration** (read-only via ICS)
- Persistent storage with SQLite database
- Responsive and user-friendly interface

## Technologies

- **Backend**: Node.js with Express
- **Database**: SQLite3
- **Frontend**: HTML, CSS, JavaScript
- **Calendar library**: FullCalendar 6.1.8
- **Environment variables**: dotenv

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

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your calendar ICS URL (optional, for Teams/Outlook integration):
```
ICS_URL=https://your-outlook-calendar-ics-url.ics
```

## Getting your Outlook/Teams ICS URL

1. Go to [Outlook Web](https://outlook.office365.com)
2. Settings → View all Outlook settings
3. Calendar → Shared calendars
4. "Publish a calendar" → Select your calendar and permissions
5. Copy the ICS link

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

### Teams/Outlook events
- Events from Teams/Outlook are displayed in purple
- These events are read-only (cannot be edited or deleted from this app)

## Project structure

```
Calendario/
├── public/
│   ├── calendar.js      # Calendar logic
│   ├── index.html       # Main page
│   └── styles.css       # Styles
├── .env                 # Environment variables (not tracked)
├── .env.example         # Environment variables template
├── database.db          # SQLite database
├── server.js            # Express server
├── package.json         # Configuration and dependencies
└── README.md
```

## API Endpoints

- `GET /` - Main page
- `GET /eventos` - Get all local events
- `GET /eventos-teams` - Get events from Teams/Outlook calendar
- `POST /eventos` - Create new event
- `PUT /eventos/:id` - Update event
- `DELETE /eventos/:id` - Delete event

## License

ISC

# IDP System v2 - React Frontend

Modern, responsive React frontend for the Intelligent Document Processing system.

## Features

- 📄 **Document Processing** - Drag-and-drop upload with real-time progress
- 🔍 **Natural Language Query** - Ask questions about your documents
- 📊 **Analytics Dashboard** - Visualize processing statistics
- 🗂️ **Collection Management** - Organize and browse documents
- ⚙️ **System Settings** - Monitor AI model status

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Zustand** - State management
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Quick Start

### Prerequisites

- Node.js 18+
- Backend running on port 8002

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Preview build
npm run preview
```

### Docker

```bash
# Build image
docker build -t idp-frontend .

# Run container
docker run -p 80:80 idp-frontend
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.jsx       # Main layout with sidebar
│   └── FileUpload.jsx   # Drag-and-drop uploader
├── pages/               # Route pages
│   ├── Dashboard.jsx    # Home page
│   ├── Process.jsx      # Document processing
│   ├── Query.jsx        # Q&A interface
│   ├── Collections.jsx  # Document management
│   ├── Analytics.jsx    # Statistics
│   └── Settings.jsx     # Configuration
├── hooks/               # Custom React hooks
│   └── useApi.js        # Data fetching hooks
├── services/            # API & state
│   ├── api.js           # Axios API client
│   └── store.js         # Zustand stores
├── styles/              # Global CSS
│   └── index.css        # Tailwind + custom styles
├── App.jsx              # Root component
└── main.jsx             # Entry point
```

## Configuration

Create `.env` file:

```env
VITE_API_URL=http://localhost:8002/api/v1
```

## Design System

### Colors

- **Primary**: Cyan (#06b6d4)
- **Background**: Dark slate (#0a0a10 → #1e1e2e)
- **Success**: Green (#22c55e)
- **Warning**: Amber (#eab308)
- **Error**: Red (#ef4444)

### Typography

- **Display**: Space Grotesk
- **Body**: DM Sans
- **Code**: JetBrains Mono

## Screenshots

### Dashboard
![Dashboard](docs/dashboard.png)

### Document Processing
![Process](docs/process.png)

### Query Interface
![Query](docs/query.png)

## License

MIT

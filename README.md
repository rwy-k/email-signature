# My NX Monorepo

This is a fullstack monorepo built with NX, featuring a Vue frontend and a Node.js backend. 

## Project Structure

```
email-signature
├── apps
│   ├── frontend          # Vue frontend application
│   └── backend           # Node.js backend application
├── nx.json               # NX workspace configuration
├── package.json          # NPM dependencies and scripts
├── tsconfig.base.json    # Base TypeScript configuration
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (version >= 14)
- npm or yarn
- Docker and Docker Compose (for containerized deployment)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd email-signature
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Running the Applications

#### Frontend

To run the Vue frontend application, navigate to the frontend directory and start the development server:

```
cd apps/frontend
npm install
npm run dev
```

#### Backend

To run the Node.js backend application, navigate to the backend directory and start the server:

```
cd apps/backend
npm install
npm run build
npm run start
```

### Building the Applications

To build the applications for production, use the following commands:

#### Frontend

```
cd apps/frontend
npm run build
```

#### Backend

```
cd apps/backend
npm run build
```

#### Docker Deployment

To run the entire application stack in Docker:
```
docker-compose up --build
```

This will start both the frontend and backend services in separate containers as defined in the docker-compose.yml file.

To stop the containers:
```
docker-compose down
```
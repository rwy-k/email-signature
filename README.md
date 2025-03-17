# My NX Monorepo

This is a fullstack monorepo built with NX, featuring a Vue frontend and a Node.js backend. 

## Project Structure

```
email-signature
├── apps
│   ├── frontend          # Vue frontend application
│   └── backend           # Node.js backend application
├── libs
│   └── shared            # Shared library for common utilities and types
├── nx.json               # NX workspace configuration
├── package.json          # NPM dependencies and scripts
├── tsconfig.base.json    # Base TypeScript configuration
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (version >= 14)
- npm or yarn

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
npm run dev
```

#### Backend

To run the Node.js backend application, navigate to the backend directory and start the server:

```
cd apps/backend
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

## Shared Library

The `libs/shared` directory contains shared utilities and types that can be used across both the frontend and backend applications.

## Contributing

Feel free to submit issues or pull requests for any improvements or features you would like to see!

## License

This project is licensed under the MIT License.
# Company Management Frontend

A Next.js 15 application for managing companies with full CRUD operations, built with Redux Toolkit and ShadCN UI.

## Features

- **Complete CRUD Operations**: Create, read, update, and delete companies
- **Real-time Search**: Filter companies by name, address, phone, or email
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Form Validation**: Client-side validation with Zod schemas
- **State Management**: Redux Toolkit for efficient state management
- **Modern UI**: ShadCN UI components with Radix UI primitives
- **Type Safety**: Full TypeScript support throughout the application

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: ShadCN UI + Radix UI
- **Styling**: TailwindCSS
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 20+ required
- npm or yarn package manager

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd cdk_front_company
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and configure your API URL:
   ```bash
   cp .env.local.example .env.local
   ```

4. Update `.env.local` with your API configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

### Development

Start the development server on port 3003:
```bash
npm run dev
```

The application will be available at [http://localhost:3003](http://localhost:3003).

### Build

Create a production build:
```bash
npm run build
```

### Lint

Run ESLint to check for code issues:
```bash
npm run lint
```

## API Integration

The application integrates with the Company Management API with the following endpoints:

- `GET /api/company/v1/companies` - List all companies
- `POST /api/company/v1/companies` - Create a new company
- `GET /api/company/v1/companies/{id}` - Get a specific company
- `PUT /api/company/v1/companies/{id}` - Update a company
- `DELETE /api/company/v1/companies/{id}` - Delete a company

### Company Schema

```typescript
interface Company {
  id: string
  name: string
  address: string
  phone: string
  email?: string
  website?: string
  status: 'ACTIVE' | 'DELETED'
}
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main company management page
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   └── CompanyForm.tsx   # Company create/edit form
├── lib/                  # Utilities and configurations
│   ├── redux/           # Redux store and slices
│   └── utils.ts         # Utility functions
└── services/            # API service layer
    └── companyService.ts # Company API integration
```

## Features Overview

### Company Management Dashboard

- **Company Listing**: Sortable table with all company information
- **Search & Filter**: Real-time search across company fields
- **CRUD Operations**: Create, edit, and delete companies
- **Status Management**: Track company status (Active/Deleted)

### Form Validation

- **Required Fields**: Name, address, and phone are required
- **Email Validation**: Optional email field with format validation
- **URL Validation**: Optional website field with URL format validation
- **Real-time Validation**: Instant feedback on form errors

### State Management

- **Redux Toolkit**: Centralized state management for companies
- **Async Actions**: Thunks for API operations with loading states
- **Error Handling**: Global error state management
- **Optimistic Updates**: Immediate UI updates with rollback on error

### User Experience

- **Loading States**: Skeleton screens and loading indicators
- **Toast Notifications**: Success and error notifications
- **Confirmation Dialogs**: Delete confirmation with company details
- **Responsive Design**: Works seamlessly on desktop and mobile

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Add proper error handling and loading states
4. Test CRUD operations thoroughly
5. Follow the established component structure

## Environment Configuration

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Development Configuration
NODE_ENV=development
```

## Port Configuration

This application runs on port 3003 by default to avoid conflicts with other microservices:

- **cdk_front_app_shell**: Port 3000
- **cdk_front_login**: Port 3001
- **cdk_front_payment**: Port 3002
- **cdk_front_company**: Port 3003 (this application)

## Integration with Backend

Ensure your backend Company Management API is running and accessible at the configured URL. The service expects standard REST endpoints with JSON payloads and responses.
# AI-Powered Patient Triage System

## Overview

This is a modern web application that simulates an AI-powered patient triage system for medical demos. The application collects patient symptoms through an interactive questioning flow, generates clinical assessment notes using AI, and stores the data for physician review.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom medical theme colors
- **State Management**: React hooks with custom triage hook for complex state
- **Data Fetching**: TanStack Query (React Query) for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple

### Key Components

#### Patient Triage Flow
1. **Patient Input Screen**: Clean interface for entering primary complaint
2. **Questioning Flow**: AI-generated follow-up questions (2-3 questions)
3. **SOAP Note Generation**: AI creates structured clinical notes
4. **Physician Review**: Dashboard for reviewing all triage sessions

#### AI Integration
- **Provider**: Google Gemini API (@google/genai)
- **Purpose**: Generates dynamic follow-up questions and creates SOAP-like notes
- **Structure**: Subjective, Objective, Assessment, Plan format

#### Data Storage
- **Primary**: PostgreSQL database with Drizzle ORM
- **Secondary**: Firebase Firestore for demo data storage
- **Schema**: User table with extensible design for triage data

## Data Flow

1. Patient enters primary complaint
2. AI generates contextual follow-up questions
3. Patient responses are collected and stored
4. AI synthesizes responses into SOAP note format
5. Complete triage session is saved to both PostgreSQL and Firestore
6. Physicians can review all sessions through admin interface

## External Dependencies

### AI Services
- Google Gemini API for natural language processing
- Dynamic question generation based on symptoms
- Clinical note synthesis

### Database Services
- Neon Database for PostgreSQL hosting
- Firebase/Firestore for demo data persistence
- Session storage using PostgreSQL

### UI Components
- Radix UI primitives for accessibility
- Shadcn/ui component library
- Lucide React for icons
- React Hook Form for form management

## Deployment Strategy

### Development
- Vite dev server with hot module replacement
- Express server with TypeScript compilation via tsx
- Database migrations via Drizzle Kit
- Replit-specific development tools integration

### Production Build
- Frontend: Vite build with optimized assets
- Backend: esbuild bundling for Node.js deployment
- Static assets served from Express
- Environment-based configuration

### Environment Configuration
- Database URL for PostgreSQL connection
- Firebase configuration for Firestore
- Gemini API key for AI services
- Replit-specific environment variables

### Database Management
- Drizzle migrations in `./migrations` directory
- Schema definitions in `./shared/schema.ts`
- Push-based deployment with `db:push` command

The application is designed as a demo system with a focus on clean UI, smooth user experience, and integration of AI services for medical triage simulation.
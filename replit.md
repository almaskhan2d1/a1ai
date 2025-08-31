# Overview

This is a full-stack AI-powered web application that provides text generation and image analysis capabilities using Google's Gemini AI. The application features a modern React frontend with multiple themes, user authentication, and a conversational chat interface. Users can register, log in, and interact with the AI through both text prompts and image uploads for analysis.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for development and building
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and React Context for local state
- **Theme System**: Custom theme provider supporting multiple color schemes (neon, teal, rose, amber) with localStorage persistence

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for schema definition and migrations
- **File Storage**: JSON-based file storage system as fallback/development option
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful endpoints with comprehensive error handling and logging middleware

## Authentication & Authorization
- **Strategy**: Username/password authentication with SHA-256 password hashing
- **Session Management**: Server-side sessions with secure cookie storage
- **Protected Routes**: Client-side route guards and server-side middleware protection
- **User Storage**: Database-backed user management with unique username constraints

## AI Integration
- **Provider**: Google Gemini AI API integration
- **Capabilities**: 
  - Text generation using Gemini 2.5 Flash model
  - Image analysis using Gemini 2.5 Pro model
  - Dynamic headline generation for landing page
- **File Handling**: Multer middleware for image upload processing with size limits
- **Error Handling**: Graceful fallbacks for AI service failures

## Data Architecture
- **Schema Design**: Drizzle-defined tables for users, chat sessions, and messages
- **Chat Storage**: Session-based message threading with support for text and image data
- **File Management**: Base64 image encoding for database storage
- **Migration System**: Drizzle Kit for database schema migrations

# External Dependencies

## Core Dependencies
- **@google/genai**: Google Gemini AI SDK for text generation and image analysis
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: TypeScript ORM for database operations and migrations
- **express**: Web framework for API server
- **multer**: Middleware for handling multipart/form-data and file uploads

## Frontend Libraries
- **@radix-ui/***: Headless UI component primitives for accessibility
- **@tanstack/react-query**: Data fetching and caching library
- **wouter**: Lightweight React router
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **date-fns**: Date manipulation utilities

## Development Tools
- **vite**: Frontend build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Database & Storage
- **connect-pg-simple**: PostgreSQL session store for Express
- **crypto**: Built-in Node.js module for password hashing
- **zod**: Runtime type validation and schema definition
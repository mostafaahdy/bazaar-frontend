 🛒 Bazaar.eg - Enterprise Full-Stack E-Commerce Platform

A modern, high-performance E-Commerce platform inspired by Amazon and Noon, engineered with a decoupled Full-Stack architecture adhering to Clean Architecture principles.

---

 🏗 System Architecture

 Frontend (Client)
- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **State Management:** Zustand (Cart & Wishlist persistent stores)
- **Core Modules:**
  - Dynamic Mega-Header & Responsive Mobile Nav
  - Homepage with Live Flash Deals & Countdown Timer
  - Advanced Product Listing Page (PLP) with multi-criteria real-time filtering & sorting
  - Interactive Product Details Page (PDP) with image gallery and variant selector
  - Full Cart & Multi-Step Checkout Workflow with Order Tracking

### Backend (Server & API)
- Framework: ASP.NET Core (.NET 8 Web API)
- Pattern: Clean Architecture (Domain, Application, Infrastructure, API)
- Database & ORM: PostgreSQL with Entity Framework Core (Code-First)
- Features:
  - Automated Database Seeding (Categories, Products, Variants)
  - CORS security & global error handling middleware (ProblemDetails RFC 7807)
  - Rate limiting & robust domain modeling for financial accuracy (`decimal(18,2)`)

---

 Getting Started

 1. Backend Setup
```bash
cd backend
dotnet restore
dotnet run --project src/Bazaar.API

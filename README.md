# EmailPro Dashboard

A modern, production-ready Next.js dashboard for email validation services, built with TypeScript, Tailwind CSS, and Shadcn/ui.

## Features

### 🎨 Design
- **Modern UI**: Built with Shadcn/ui components and Tailwind CSS
- **Responsive**: Fully responsive design that works on all devices
- **Theme System**: Centralized theme configuration with easy customization
- **Animations**: Smooth transitions and animations throughout

### 🔐 Authentication
- **NextAuth.js**: Secure authentication with JWT tokens
- **Session Management**: Persistent sessions with automatic refresh
- **Protected Routes**: Middleware-based route protection

### 📊 Dashboard Features
- **Overview Dashboard**: Real-time stats and analytics
- **Email Validation**: Single email validation with detailed results
- **Bulk Upload**: CSV file upload for batch validation
- **Analytics**: Charts and visualizations with Chart.js
- **History**: Searchable validation history
- **Credits Management**: View and purchase credits
- **Settings**: Account and API key management

### 🛠️ Technical Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand
- **Charts**: Chart.js with react-chartjs-2
- **Authentication**: NextAuth.js
- **API Client**: Axios
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites
- Node.js 18+ installed
- API server running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
dashboard/
├── src/
│   ├── app/                      # Next.js app router
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/         # Dashboard pages
│   │   │   └── dashboard/
│   │   │       ├── page.tsx     # Overview
│   │   │       ├── validate/    # Email validation
│   │   │       ├── bulk/        # Bulk upload
│   │   │       ├── analytics/   # Analytics
│   │   │       ├── history/     # History
│   │   │       ├── credits/     # Credits
│   │   │       └── settings/    # Settings
│   │   ├── (marketing)/         # Landing page
│   │   ├── api/                 # API routes
│   │   └── layout.tsx           # Root layout
│   ├── components/
│   │   ├── ui/                  # Shadcn/ui components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── marketing/           # Marketing components
│   │   └── providers/           # Context providers
│   ├── lib/
│   │   ├── constants/           # API routes and constants
│   │   ├── services/            # API service layer
│   │   ├── stores/              # Zustand stores
│   │   ├── theme/               # Theme configuration
│   │   ├── utils.ts             # Utility functions
│   │   └── auth.ts              # Auth configuration
│   └── types/                   # TypeScript types
├── public/                      # Static assets
└── package.json
```

## Theme Customization

The dashboard uses a centralized theme system. To customize colors:

1. Edit `/src/lib/theme/constants.ts`:
```typescript
export const themeConfig = {
  colors: {
    primary: {
      DEFAULT: '#ff4b6e',  // Change this to your brand color
      // ...
    },
    // ...
  }
};
```

2. The changes will automatically apply throughout the application.

## API Integration

The dashboard integrates with the API server through:

1. **API Service Layer** (`/src/lib/services/api.ts`):
   - Centralized API calls
   - Error handling
   - Mock data fallbacks

2. **Zustand Stores** (`/src/lib/stores/`):
   - State management
   - API data caching
   - Loading states

3. **API Constants** (`/src/lib/constants/api.ts`):
   - Endpoint definitions
   - Type-safe route constants

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Pages

### Landing Page (`/`)
- Hero section with live email validation demo
- Features showcase
- Pricing plans
- Integration examples
- Call-to-action sections

### Authentication
- **Login** (`/login`): User login with email and password
- **Register** (`/register`): New user registration

### Dashboard (`/dashboard`)
- **Overview**: Stats, charts, and recent activity
- **Validate**: Single email validation
- **Bulk**: CSV file upload for batch validation
- **Analytics**: Detailed charts and insights
- **History**: Searchable validation history
- **Credits**: View balance and purchase credits
- **Settings**: Account, API keys, notifications, security

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API server base URL | `http://localhost:3000/api` |
| `NEXTAUTH_URL` | NextAuth callback URL | `http://localhost:3001` |
| `NEXTAUTH_SECRET` | NextAuth secret key | (required) |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
# Build
docker build -t emailpro-dashboard .

# Run
docker run -p 3001:3001 emailpro-dashboard
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@emailpro.com or open an issue on GitHub.


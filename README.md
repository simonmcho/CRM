# Hotel Management System

A modern, full-stack hotel and motel management application built with Next.js, TypeScript, and deployed on AWS.

## Features

- **Room Management**: Track room availability, types, and statuses
- **Guest Management**: Manage guest information and profiles
- **Booking System**: Handle reservations, check-ins, and check-outs
- **Payment Processing**: Track payments and billing
- **Dashboard**: Real-time analytics and insights
- **User Management**: Role-based access control

## Tech Stack

### Frontend & Backend

- **Next.js 14** - Full-stack React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Query** - Data fetching and caching

### Database

- **PostgreSQL** - Relational database
- **Prisma** - Database ORM and migrations

### Infrastructure

- **AWS CDK** - Infrastructure as Code
- **AWS RDS** - Managed PostgreSQL database
- **AWS ECS Fargate** - Containerized application hosting
- **AWS Application Load Balancer** - Load balancing and SSL termination

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── lib/             # Utility functions and configurations
│   └── types/           # TypeScript type definitions
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── infrastructure/      # AWS CDK infrastructure code
├── docs/               # Documentation
└── public/             # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local development)
- AWS CLI configured (for deployment)
- Docker (optional, for local PostgreSQL)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hotel-management-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd infrastructure && npm install && cd ..
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env with your database and other configurations
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Seed the database (optional)
   npm run db:seed
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main entities:

- **Hotels**: Property information
- **Rooms**: Room details, types, and availability
- **Guests**: Customer information
- **Bookings**: Reservations and stays
- **Payments**: Financial transactions
- **Users**: System users with role-based access

## API Routes

The application provides REST API endpoints under `/api/`:

- `/api/hotels` - Hotel management
- `/api/rooms` - Room operations
- `/api/guests` - Guest management
- `/api/bookings` - Booking system
- `/api/payments` - Payment processing

## Deployment

### AWS Deployment with CDK

1. **Configure AWS credentials**

   ```bash
   aws configure
   ```

2. **Deploy infrastructure**

   ```bash
   npm run cdk:deploy
   ```

3. **Build and deploy application**
   ```bash
   npm run build
   # Deploy Docker image to ECR and update ECS service
   ```

The CDK stack includes:

- VPC with public/private subnets
- RDS PostgreSQL database
- ECS Fargate service
- Application Load Balancer
- Security groups and IAM roles

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run cdk:deploy` - Deploy AWS infrastructure
- `npm run cdk:destroy` - Destroy AWS infrastructure

### Database Operations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View data
npm run db:studio
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is private and proprietary.

## Support

For support and questions, please contact the development team.

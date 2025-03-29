# WhatsApp Order Management AI Bot

A full-stack AI-powered WhatsApp bot for order management, built with Next.js, MongoDB, and WhatsApp Business API.

## Features

- 🤖 AI-powered WhatsApp chatbot
- 🛍️ Product browsing and search
- 🛒 Order management
- 💳 Bank transfer payment integration
- 📱 Payment proof upload
- 👥 User authentication
- 📊 Admin dashboard
- 🔄 Real-time updates

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk
- **File Storage**: Linode Object Storage
- **Real-time**: Socket.IO
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18.x or later
- MongoDB instance
- WhatsApp Business API account
- Clerk account for authentication
- Linode account for file storage

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your environment variables:

```bash
cp .env.example .env.local
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/whatsapp-ordermgt.git
cd whatsapp-ordermgt
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Run the development server:

```bash
npm run dev
```

## WhatsApp Business API Setup

1. Create a Meta Developer account
2. Set up a WhatsApp Business API application
3. Configure webhook URL: `https://your-domain.com/api/webhook`
4. Set up message templates in Meta Developer Console

## Deployment

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## Admin Dashboard

Access the admin dashboard at `/admin` to:

- Manage products
- View and process orders
- Monitor user interactions
- View analytics

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

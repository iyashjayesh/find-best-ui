# Price Comparison Tool 🛒

A modern, responsive web application that helps users find the best prices across multiple retailers instantly. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Multi-Retailer Search**: Search for products across multiple online retailers simultaneously
- **Real-time Price Comparison**: Get live pricing data and compare prices side by side
- **Country-Specific Search**: Search for products in different countries/regions
- **Responsive Design**: Beautiful, modern UI that works on desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes
- **Loading States**: Elegant loading animations during search operations
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Tech Stack

- **Frontend**: Next.js 14+ with React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: RESTful API endpoints
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd find-best-ui
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## API Integration

The application connects to a backend API through the `/api/search` endpoint. The search functionality expects:

**Request Format:**
```json
{
  "query": "product name",
  "country": "country code"
}
```

**Response Format:**
```json
[
  {
    "productName": "Product Name",
    "price": "29.99",
    "currency": "USD",
    "link": "https://retailer.com/product"
  }
]
```

## Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── SearchForm.tsx   # Search input form
│   │   ├── ResultsDisplay.tsx # Product results display
│   │   └── LoadingSpinner.tsx # Loading animation
│   ├── api/
│   │   └── search/
│   │       └── route.ts     # API route handler
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx            # Home page
└── ...
```

## Features in Detail

### Search Form
- Product name input with validation
- Country/region selection dropdown
- Search button with loading states

### Results Display
- Product cards with name, price, and retailer links
- Price sorting and filtering options
- Responsive grid layout

### Loading States
- Animated spinner during searches
- Progress indicators for long-running operations
- Search query display during loading

### Error Handling
- Network error handling
- API error responses
- User-friendly error messages

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Author

Made with ☕️ and 🥐 by [Yash](https://www.yashchauhan.dev/)

---

For questions or support, please open an issue in the repository.
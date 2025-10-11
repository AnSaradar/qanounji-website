# Qanounji Website

A modern Next.js application built with the latest stable technologies.

## 🚀 Tech Stack

- **Next.js 15.5.4** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **TailwindCSS v4** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library for React
- **ShadCN UI** - Re-usable components built with Radix UI and Tailwind
- **Lucide React** - Beautiful & consistent icon set

## 📦 Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## 🛠️ Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Adding ShadCN Components

You can add any ShadCN component using:

```bash
npx shadcn@latest add [component-name]
```

For example:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

## 📁 Project Structure

```
qanounji_website/
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/          # React components
│   └── ui/             # ShadCN UI components
├── lib/                # Utility functions
│   └── utils.ts        # Helper utilities
├── public/             # Static assets
└── next.config.ts      # Next.js configuration
```

## 🎯 Features

- ✅ Server-side rendering (SSR)
- ✅ Static site generation (SSG)
- ✅ API routes
- ✅ TypeScript support
- ✅ Tailwind CSS v4
- ✅ Framer Motion animations
- ✅ ShadCN UI components
- ✅ ESLint configuration
- ✅ Turbopack for faster development

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [ShadCN UI Documentation](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

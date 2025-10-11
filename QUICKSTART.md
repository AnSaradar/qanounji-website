# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies (Already Done!)
Dependencies are already installed. If you need to reinstall:
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see your app!

### 3. Start Building
Edit `app/page.tsx` and see your changes live!

---

## 📦 Adding ShadCN Components

Add any component from the ShadCN library:

```bash
# Examples:
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add input
npx shadcn@latest add form
```

Browse all components: https://ui.shadcn.com/docs/components

---

## 🎨 Using Framer Motion

Framer Motion is already installed and ready to use!

### Basic Animation Example:

```tsx
"use client";

import { motion } from "framer-motion";

export default function MyComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1>Animated Content!</h1>
    </motion.div>
  );
}
```

**Important:** Components using Framer Motion must be client components (add `"use client"` at the top).

---

## 🎨 TailwindCSS Tips

TailwindCSS v4 is configured and ready to use!

### Quick Tips:
- Use utility classes directly in your JSX: `className="bg-blue-500 text-white p-4"`
- Dark mode is enabled: `className="bg-white dark:bg-gray-800"`
- Responsive design: `className="text-sm md:text-lg lg:text-xl"`

### Custom Styles:
Add custom styles in `app/globals.css`

---

## 📁 Project Structure

```
qanounji_website/
├── app/
│   ├── layout.tsx        # Root layout (wraps all pages)
│   ├── page.tsx          # Home page (/)
│   └── globals.css       # Global styles & Tailwind
├── components/
│   ├── ui/               # ShadCN components
│   └── demo-card.tsx     # Example custom component
├── lib/
│   └── utils.ts          # Utility functions
└── public/               # Static assets (images, fonts, etc.)
```

---

## 🛠️ Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 📚 Useful Resources

- **Next.js Docs:** https://nextjs.org/docs
- **TailwindCSS Docs:** https://tailwindcss.com/docs
- **Framer Motion Docs:** https://www.framer.com/motion/
- **ShadCN UI:** https://ui.shadcn.com/
- **Lucide Icons:** https://lucide.dev/

---

## 🎯 Next Steps

1. **Customize the home page** - Edit `app/page.tsx`
2. **Add more pages** - Create new files in the `app/` directory
3. **Add components** - Create reusable components in `components/`
4. **Install more ShadCN components** - Use `npx shadcn@latest add [component]`
5. **Configure environment variables** - Copy `.env.example` to `.env.local`

---

## 💡 Tips

### Creating New Pages
Create a new folder in `app/` with a `page.tsx` file:
```
app/
├── about/
│   └── page.tsx      # Creates /about route
└── contact/
    └── page.tsx      # Creates /contact route
```

### Using Client vs Server Components
- **Server Components** (default): Fast, SEO-friendly, no interactivity
- **Client Components** (add `"use client"`): Interactive, can use hooks, state, and Framer Motion

### Using ShadCN Components
```tsx
import { Button } from "@/components/ui/button";

export default function MyPage() {
  return <Button>Click me!</Button>;
}
```

---

Happy coding! 🚀


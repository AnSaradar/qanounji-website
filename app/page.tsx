"use client";

import { motion } from "framer-motion";
import { Sparkles, Code, Palette, Zap } from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const features = [
    {
      icon: <Code className="w-6 h-6" />,
      title: "Next.js 15",
      description: "Latest stable version with App Router",
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "TailwindCSS v4",
      description: "Modern utility-first CSS framework",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Framer Motion",
      description: "Production-ready animations",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "ShadCN UI",
      description: "Beautiful reusable components",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        className="container mx-auto px-4 py-16 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          variants={itemVariants}
        >
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Qanounji Website
          </motion.h1>
          <motion.p
            className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8"
            variants={itemVariants}
          >
            Built with modern technologies for the future
          </motion.p>
          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            variants={itemVariants}
          >
            <motion.button
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
            <motion.button
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech Stack Info */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
            Tech Stack
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
            {[
              "Next.js 15.5.4",
              "TypeScript",
              "TailwindCSS v4",
              "Framer Motion",
              "ShadCN UI",
            ].map((tech, index) => (
              <motion.div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  {tech}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="mt-16 text-center text-gray-600 dark:text-gray-400"
          variants={itemVariants}
        >
          <p>Ready to build something amazing? Edit <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">app/page.tsx</code> to get started.</p>
        </motion.footer>
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface DemoCardProps {
  title: string;
  description: string;
  delay?: number;
}

export function DemoCard({ title, description, delay = 0 }: DemoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      <div className="flex gap-2 flex-wrap">
        <Button variant="default" size="sm">
          Default
        </Button>
        <Button variant="secondary" size="sm">
          Secondary
        </Button>
        <Button variant="outline" size="sm">
          Outline
        </Button>
        <Button variant="ghost" size="sm">
          <Heart className="mr-2 h-4 w-4" />
          Like
        </Button>
      </div>
    </motion.div>
  );
}


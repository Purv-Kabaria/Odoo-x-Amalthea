"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export function Loading() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/20"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0.8 }}
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.8, 1, 0.8] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="flex flex-col items-center">
        <div className="relative h-16 w-16 mb-4">
          <Image
            src="/images/logo-blue.svg"
            alt="Placeholder Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

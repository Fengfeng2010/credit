"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 404 Not Found Page
 * 当用户访问不存在的页面时显示
 */
export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            className="mb-8"
          >
            <h1 className="text-[120px] md:text-[180px] font-bold leading-none bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
              404
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8 space-y-3"
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              页面走丢了
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
              抱歉，您访问的页面不存在或已被移除。请检查 URL 是否正确，或返回首页继续浏览。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/">
              <Button
                size="lg"
                className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>

            <Link href="/home">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 border-border hover:bg-accent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回控制台
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 pt-8 border-t border-border"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Search className="w-4 h-4" />
              <span>您可以尝试使用导航栏的搜索功能找到想要的内容</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-8"
          >
            <p className="text-sm text-muted-foreground mb-4">或者访问这些页面：</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { href: "/merchant", label: "商户" },
                { href: "/docs/api", label: "文档" },
                { href: "/settings", label: "设置" },
                { href: "/", label: "首页" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

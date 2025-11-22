"use client"

import React, { useRef, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
    ArrowRight,
    Shield,
    Zap,
    Globe,
    Lock,
    Smartphone,
    CheckCircle2,
    Wifi,
    HelpCircle,
    LucideIcon
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { CountingNumber } from '@/components/animate-ui/primitives/texts/counting-number'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"


interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    gradient?: boolean
}

interface GlowingBorderProps extends React.HTMLAttributes<HTMLDivElement> {
    glowColor?: string
}

interface InfiniteMarqueeProps {
    children: React.ReactNode
    direction?: "left" | "right"
    speed?: number
    pauseOnHover?: boolean
    className?: string
}

interface FeatureItem {
    title: string
    description: string
    icon: LucideIcon
}

interface FaqItem {
    question: string
    answer: string
}

const PARTNERS = [
    "Stripe", "PayPal", "Visa", "Mastercard", "Apple Pay", "Google Pay", "Alipay", "WeChat Pay"
]

const FEATURES: FeatureItem[] = [
    {
        title: "安全可靠",
        description: "加密和安全协议，保障您的数据安全。",
        icon: Shield,
    },
    {
        title: "快速便捷",
        description: "即时交易和实时状态更新，为您带来便捷的支付体验。",
        icon: Zap,
    },
    {
        title: "全球覆盖",
        description: "支持全球支付，轻松接收来自世界各地的支付。",
        icon: Globe,
    },
    {
        title: "隐私至上",
        description: "您的财务数据完全属于您。我们绝不出售或共享您的任何信息。",
        icon: Lock,
    },
    {
        title: "工单支持",
        description: "提供工单支持，让您更方便地解决支付问题。",
        icon: HelpCircle,
    },
    {
        title: "移动端友好",
        description: "针对所有设备进行了深度优化。随时随地管理您的支付。",
        icon: Smartphone,
    },
]

const FAQS: FaqItem[] = [
    {
        question: "LINUX DO PAY 安全吗？",
        answer: "是的，我们采用银行级加密技术，并符合包括 PCI-DSS 在内的所有主要安全标准，确保您的数据和交易始终安全。"
    },
    {
        question: "费用是如何计算的？",
        answer: "我们提供极具竞争力的价格，且无任何隐形费用。基础账户完全免费，交易费用会在您确认付款前清晰展示。"
    },
    {
        question: "我可以在国际上使用吗？",
        answer: "当然！LINUX DO PAY 支持超过 120 种货币，可在全球大多数国家和地区使用。"
    },
    {
        question: "如何开始使用？",
        answer: "只需点击“立即开始”按钮，几秒钟内即可创建账户，随即开始发送和接收款项。"
    }
]

function GlassCard({ children, className, gradient = false, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/60 backdrop-blur-xl transition-all duration-300 hover:bg-white/80 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-200/50",
                "dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/30 dark:hover:shadow-black/5",
                gradient && "bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

function GlowingBorder({
    children,
    className,
    glowColor = "rgba(120, 120, 120, 0.3)",
    ...props
}: GlowingBorderProps) {
    const divRef = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [opacity, setOpacity] = useState(0)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return

        const rect = divRef.current.getBoundingClientRect()
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    const handleMouseEnter = () => {
        setOpacity(1)
    }

    const handleMouseLeave = () => {
        setOpacity(0)
    }

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative rounded-2xl border border-neutral-200 bg-background overflow-hidden dark:border-white/10",
                className
            )}
            {...props}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`,
                    opacity,
                    zIndex: 10,
                }}
            />
            <div className="relative z-20 h-full">{children}</div>
        </div>
    )
}

function HeroMockup() {
    return (
        <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[1.65] mx-auto perspective-1000">
            <motion.div
                initial={{ rotateY: -20, rotateX: 10, scale: 0.9 }}
                animate={{
                    rotateY: [-20, -10, -20],
                    rotateX: [10, 5, 10],
                    y: [0, -10, 0]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative w-full h-full rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 shadow-2xl border border-white/10 overflow-hidden preserve-3d"
                style={{ transformStyle: "preserve-3d" }}
            >
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-6 rounded bg-gradient-to-r from-yellow-400 to-yellow-200 opacity-80" />
                        <Wifi className="w-6 h-6 rotate-90 text-white/50" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="h-2 w-16 rounded-full bg-white/20" />
                            <div className="h-2 w-8 rounded-full bg-white/20" />
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <div className="font-mono text-xs text-white/40">持卡人</div>
                                <div className="font-mono text-sm text-white/80">LINUX DO User</div>
                            </div>
                            <div className="text-xl font-sans font-bold italic text-blue-600">PAY</div>
                        </div>
                    </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 z-20 pointer-events-none" />
                <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
            </motion.div>
        </div>
    )
}

function InfiniteMarquee({
    children,
    direction = "left",
    speed = 20,
    pauseOnHover = true,
    className,
}: InfiniteMarqueeProps) {
    return (
        <div
            className={cn(
                "group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)]",
                className
            )}
        >
            <motion.div
                initial={{ x: 0 }}
                animate={{ x: direction === "left" ? "-100%" : "100%" }}
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className={cn(
                    "flex shrink-0 justify-around [gap:var(--gap)] min-w-full",
                    pauseOnHover && "group-hover:[animation-play-state:paused]"
                )}
            >
                {children}
            </motion.div>
            <motion.div
                initial={{ x: 0 }}
                animate={{ x: direction === "left" ? "-100%" : "100%" }}
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className={cn(
                    "flex shrink-0 justify-around [gap:var(--gap)] min-w-full",
                    pauseOnHover && "group-hover:[animation-play-state:paused]"
                )}
            >
                {children}
            </motion.div>
        </div>
    )
}

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white text-neutral-900 selection:bg-blue-100 selection:text-blue-900 font-sans overflow-x-hidden">

            {/* Hero Section */}
            <section className="relative min-h-[100svh] flex flex-col items-center justify-center pt-24 pb-12 lg:pt-32 lg:pb-20">
                <div className="absolute inset-0 z-0">
                    <AuroraBackground>
                        <div></div>
                    </AuroraBackground>
                </div>

                <div className="relative z-10 container mx-auto px-4 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mx-auto space-y-6 text-center lg:text-left order-2 lg:order-1"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-neutral-200 text-xs font-medium text-neutral-600 tracking-wide uppercase backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            现已开启 Beta 测试
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                            LINUX DO <br />
                            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl italic font-serif text-blue-600">PAY</span>
                        </h1>
                        <p className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                            简单、安全，专为 LINUX DO 设计。
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button size="lg" className="rounded-full h-8 px-6 sm:h-10 bg-neutral-900 hover:bg-neutral-700 font-bold text-sm">
                                    立即开始 <ArrowRight className="ml-2 size-4" />
                                </Button>
                            </Link>
                            <Link href="/about" className="w-full sm:w-auto">
                                <Button variant="ghost" size="lg" className="w-full sm:w-auto rounded-full px-6 h-8 sm:h-10 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 font-bold text-sm">
                                    了解更多
                                </Button>
                            </Link>
                        </div>

                        <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-neutral-400">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                <span>全球覆盖</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                <span>安全支付</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                <span>快速到账</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className="relative flex items-center justify-center order-1 lg:order-2"
                    >
                        <div className="relative w-full max-w-[300px] sm:max-w-md">
                            <div className="absolute top-0 -left-4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
                            <div className="absolute top-0 -right-4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
                            <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
                            <HeroMockup />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Partners Section */}
            <section className="py-12 border-b border-neutral-100 bg-neutral-50/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 mb-8 text-center">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">深受行业信赖的支付解决方案</p>
                </div>
                <InfiniteMarquee speed={30}>
                    {PARTNERS.map((partner, i) => (
                        <div key={i} className="mx-8 text-xl sm:text-2xl font-bold text-neutral-900 hover:text-neutral-500 transition-colors cursor-default">
                            {partner}
                        </div>
                    ))}
                </InfiniteMarquee>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 sm:py-32 relative z-10 bg-neutral-50/30 border-b border-neutral-200/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16 sm:mb-24 space-y-4"
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
                            专为 <span className="text-blue-600">卓越</span> 而设计
                        </h2>
                        <p className="text-neutral-500 text-base sm:text-lg max-w-2xl mx-auto px-4">
                            每一个细节都经过精心打磨，只为提供最佳的支付体验。
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {FEATURES.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <GlowingBorder className="h-full border-none">
                                    <GlassCard className="h-full p-4 sm:p-6 flex flex-col gap-4 bg-white group">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center border-none justify-center text-blue-600 mb-2">
                                            <feature.icon className="size-5" />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-semibold text-neutral-900">{feature.title}</h3>
                                        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </GlassCard>
                                </GlowingBorder>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 sm:py-24 bg-white relative z-10 border-b border-neutral-200/20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16 sm:mb-24 space-y-4"
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
                            数据 <span className="text-blue-600">证明</span> 实力
                        </h2>
                        <p className="text-neutral-500 text-base sm:text-lg max-w-2xl mx-auto px-4">
                            强大的数据支持，安全稳定的支付体验。
                        </p>
                    </motion.div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0 * 0.1, duration: 0.5 }}
                            className="space-y-2"
                        >
                            <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
                                <CountingNumber number={1000} decimalPlaces={0} /> w+
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-neutral-500 uppercase tracking-wider">
                                累计交易量
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1 * 0.1, duration: 0.5 }}
                            className="space-y-2"
                        >
                            <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
                                <CountingNumber number={20} decimalPlaces={0} /> w+
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-neutral-500 uppercase tracking-wider">
                                活跃用户
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 2 * 0.1, duration: 0.5 }}
                            className="space-y-2"
                        >
                            <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
                                <CountingNumber number={162} decimalPlaces={0} />
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-neutral-500 uppercase tracking-wider">
                                覆盖国家
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 3 * 0.1, duration: 0.5 }}
                            className="space-y-2"
                        >
                            <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
                                <CountingNumber number={99.99} decimalPlaces={2} />%
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-neutral-500 uppercase tracking-wider">
                                稳定服务率
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 sm:py-32 bg-white border-b border-neutral-200/40">
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12 sm:mb-16 space-y-4"
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
                            常见问题 <span className="text-blue-600">解答</span>
                        </h2>
                        <p className="text-neutral-500">关于 LINUX DO PAY 您需要知道的一切。</p>

                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {FAQS.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`} className="border-b border-neutral-200 last:border-0 px-2 sm:px-4">
                                    <AccordionTrigger className="text-base sm:text-lg text-neutral-800 hover:no-underline hover:text-blue-600 py-4 sm:py-6 text-left">{faq.question}</AccordionTrigger>
                                    <AccordionContent className="text-sm sm:text-base leading-relaxed text-neutral-500 pb-4 sm:pb-6">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>

                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 sm:py-32 relative overflow-hidden border-b border-neutral-200/50">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-white" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl mx-auto space-y-8"
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-neutral-900">
                            准备好开始了吗？
                        </h2>
                        <p className="text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto px-4">
                            加入成千上万信赖 LINUX DO PAY 的用户。
                            今天就开始您的旅程。
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button size="lg" className="w-auto rounded-full px-6 h-8 sm:h-10 bg-neutral-900 text-white hover:bg-neutral-700 font-bold text-sm">
                                    创建账户
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-neutral-200 bg-white text-neutral-500 text-sm">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                    <div className="flex items-center gap-2">
                        <div className="font-bold text-neutral-900 text-lg tracking-tight">LINUX DO PAY</div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium border border-neutral-200">BETA</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
                        <a href="#" className="hover:text-neutral-900 transition-colors">隐私政策</a>
                        <a href="#" className="hover:text-neutral-900 transition-colors">服务条款</a>
                        <a href="#" className="hover:text-neutral-900 transition-colors">支持中心</a>
                    </div>
                    <div className="text-neutral-400">
                        &copy; {new Date().getFullYear()} LINUX DO PAY. 版权所有。
                    </div>
                </div>
            </footer>
        </div>
    )
}

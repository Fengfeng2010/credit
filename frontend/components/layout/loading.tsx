import * as React from "react"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FileTextIcon } from "lucide-react"

/**
 * 加载页面组件
 * 
 * 用于统一显示加载状态
 * @example
 * ```tsx
 * <LoadingPage text="系统" badgeText="系统" />
 * ```
 * @param {string} text - 显示的文本内容，默认为"系统"
 * @param {string} badgeText - 显示的徽章文本，默认为"系统"
 * @returns {React.ReactNode} 加载页面组件
 */
/**
 * 3D 旋转卡片加载动画组件
 */
function LoadingCard() {
  return (
    <div className="relative w-full max-w-[240px] aspect-[1.6] mx-auto perspective-1000">
      <div className="absolute top-0 -left-4 w-48 h-48 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-48 h-48 bg-yellow-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-10 w-48 h-48 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <motion.div
        initial={{ rotateY: -20, rotateX: 10, scale: 0.9 }}
        animate={{
          rotateY: [-20, -10, -20],
          rotateX: [10, 5, 10],
          y: [0, -10, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-full h-full rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 shadow-2xl border border-white/10 overflow-hidden preserve-3d"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
          <div className="flex justify-between items-start">
            <div className="w-8 h-5 rounded bg-gradient-to-r from-yellow-400 to-yellow-200 opacity-80" />
            <div className="w-5 h-5 rounded-full border-2 border-white/20" />
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="h-1.5 w-12 rounded-full bg-white/20" />
              <div className="h-1.5 w-6 rounded-full bg-white/20" />
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="h-1.5 w-8 rounded-full bg-white/10" />
                <div className="h-2 w-16 rounded-full bg-white/30" />
              </div>
              <div className="font-serif font-bold italic text-blue-600">PAY</div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 z-20 pointer-events-none" />
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
      </motion.div>
    </div>
  )
}

/**
 * 加载页面组件
 * 
 * 用于统一显示加载状态
 */
export function LoadingPage({ text = "系统", badgeText = "系统" }: { text?: string, badgeText?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="w-full max-w-md mx-auto text-center px-4 flex flex-col items-center gap-8">
        <LoadingCard />

        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2"
          >
            <span className="text-3xl font-bold tracking-tight">LINUX DO</span>
            <span className="text-4xl font-serif font-bold italic text-blue-600">PAY</span>
            {badgeText && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 ml-1">
                {badgeText}
              </Badge>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            <span>正在初始化{text}</span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

interface LoadingStateProps extends React.ComponentProps<"div"> {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  iconSize?: "sm" | "md" | "lg"
}

/**
 * 加载状态展示组件
 * 用于统一显示加载中的状态（原 EmptyState 的加载模式）
 */
export function LoadingState({
  title = "加载中",
  description = "正在获取交易数据...",
  icon: Icon = FileTextIcon,
  className,
  iconSize = "md",
}: LoadingStateProps) {
  const iconSizes = { sm: "size-8", md: "size-10", lg: "size-14" }
  const iconInnerSizes = { sm: "size-4", md: "size-5", lg: "size-7" }

  /* 渲染带加载动画的文字 */
  const renderLoadingText = (text: string) => {
    const chars = text.split('')
    return (
      <span className="inline-flex">
        {chars.map((char, index) => (
          <span
            key={index}
            className="inline-block animate-pulse opacity-80 transition-all duration-1000 ease-in-out"
            style={{
              animationDelay: `${index * 150}ms`,
              animationFillMode: 'both',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    )
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className={cn(
        "rounded-full bg-muted flex items-center justify-center mb-2 animate-pulse",
        iconSizes[iconSize]
      )}>
        <Icon className={cn("text-muted-foreground", iconInnerSizes[iconSize])} />
      </div>

      {title && (
        <h3 className="text-sm font-medium mb-1">
          {renderLoadingText(title)}
        </h3>
      )}

      {description && (
        <p className="text-xs text-muted-foreground max-w-md">
          {renderLoadingText(description)}
        </p>
      )}
    </div>
  )
}

/**
 * 带边框的加载状态组件
 */
export function LoadingStateWithBorder(props: LoadingStateProps) {
  return (
    <div className="border border-dashed rounded-lg">
      <LoadingState {...props} />
    </div>
  )
}

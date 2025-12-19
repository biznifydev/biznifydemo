import * as React from "react"

import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface DialogTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  return (
    <div className={open ? "fixed inset-0 z-50 flex items-center justify-center" : "hidden"}>
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      <div className="relative z-50 w-full max-w-lg mx-4">
        {children}
      </div>
    </div>
  )
}

const DialogTrigger = ({ asChild, children }: DialogTriggerProps) => {
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: () => {
        // This would need to be handled by the parent Dialog component
        // For now, we'll just pass through
      }
    })
  }
  return <>{children}</>
}

const DialogContent = ({ children, className }: DialogContentProps) => {
  return (
    <div className={cn(
      "relative bg-background rounded-lg shadow-lg border p-6",
      className
    )}>
      {children}
    </div>
  )
}

const DialogHeader = ({ children, className }: DialogHeaderProps) => {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  )
}

const DialogTitle = ({ children, className }: DialogTitleProps) => {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

const DialogDescription = ({ children, className }: DialogDescriptionProps) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  )
}

const DialogFooter = ({ children, className }: DialogFooterProps) => {
  return (
    <div className={cn("flex justify-end gap-2 mt-6", className)}>
      {children}
    </div>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} 
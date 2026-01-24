"use client"

import React, { useState, useCallback } from "react"
import { ConfirmDialog } from "@/components/common/confirm-dialog"

interface ConfirmOptions {
  title?: string
  description?: string
  cancelText?: string
  confirmText?: string
  variant?: "default" | "destructive"
}

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({})
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((newOptions: ConfirmOptions = {}) => {
    setIsOpen(true)
    setOptions(newOptions)
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setIsOpen(false)
    if (resolver) resolver(true)
  }, [resolver])

  const ConfirmDialogComponent = useCallback(() => (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title={options.title}
      description={options.description}
      cancelText={options.cancelText}
      confirmText={options.confirmText}
      onConfirm={handleConfirm}
      variant={options.variant}
    />
  ), [isOpen, options, handleConfirm])

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent
  }
}

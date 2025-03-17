// src/components/ui/toaster.tsx
"use client"

import React from 'react'
import { cn } from '@/utils/cn'

type ToastProps = {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
}

export const Toast = ({ message, type = 'info', onClose }: ToastProps) => {
  return (
    <div 
      className={cn(
        'fixed bottom-4 right-4 p-4 rounded-md shadow-md transition-all',
        'max-w-md',
        type === 'success' && 'bg-success text-white',
        type === 'error' && 'bg-error text-white',
        type === 'warning' && 'bg-warning text-black',
        type === 'info' && 'bg-info text-white'
      )}
    >
      <div className="flex justify-between items-center">
        <p>{message}</p>
        <button onClick={onClose} className="ml-4">
          ✕
        </button>
      </div>
    </div>
  )
}

type ToasterContextType = {
  showToast: (props: Omit<ToastProps, 'onClose'>) => void
}

const ToasterContext = React.createContext<ToasterContextType | undefined>(undefined)

export const ToasterProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([])

  const showToast = (props: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { ...props, id, onClose: () => removeToast(id) }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToasterContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToasterContext.Provider>
  )
}

export const useToaster = () => {
  const context = React.useContext(ToasterContext)
  if (context === undefined) {
    throw new Error('useToaster must be used within a ToasterProvider')
  }
  return context
}

// Componente Toaster para uso no layout
export const Toaster = () => {
  const { showToast } = useToaster()
  return null
}

export default Toaster
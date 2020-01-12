import React from 'react'

interface IPageWidthContainerProps {
  children: React.ReactNode
  narrow?: boolean
}

export default function PageWidthContainer({
  children,
  narrow,
}: IPageWidthContainerProps) {
  const width = narrow ? 'max-w-3xl px-4' : 'max-w-6xl px-6'
  return <div className={`container mx-auto h-full ${width}`}>{children}</div>
}

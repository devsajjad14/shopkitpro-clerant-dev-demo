// components/embla-carousel-wrapper.tsx
import * as React from 'react'
import useEmblaCarousel from 'embla-carousel-react'

type EmblaCarouselWrapperProps = {
  children: React.ReactNode
}

export default function EmblaCarouselWrapper({
  children,
}: EmblaCarouselWrapperProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
  })
  return (
    <div ref={emblaRef} className='overflow-hidden'>
      {children}
    </div>
  )
}

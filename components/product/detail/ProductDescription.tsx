interface ProductDescriptionProps {
  description: string
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  // Process description to enhance features list
  const processedDescription = description
    .replace(/&gt;/g, '<span class="feature-icon">✓</span>') // Replace > with styled checkmark
    .replace(/<br\s*\/?>/g, '</div><div class="feature-item">') // Convert line breaks to feature items
    .replace(
      /OTHER FEATURES:/i,
      '</div><div class="features-container"><div class="feature-item">'
    ) // Start features section
    .replace(
      /(<\/div><div class="feature-item">)([^<]*)$/,
      '$1</div><div class="description-text">$2</div>'
    ) // Close features section

  return (
    <div className='product-description-container'>
      <h3 className='section-title'>Product Details</h3>

      <div
        className='description-content'
        dangerouslySetInnerHTML={{ __html: processedDescription }}
      />

      <style jsx>{`
        .product-description-container {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          background: white;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
        }

        @media (min-width: 640px) {
          .product-description-container {
            border-radius: 12px;
            padding: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .product-description-container {
            padding: 2rem;
          }
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f3f4f6;
          position: relative;
        }

        @media (min-width: 640px) {
          .section-title {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
          }
        }

        .section-title::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -1px;
          width: 60px;
          height: 2px;
          background: #10b981;
        }

        @media (min-width: 640px) {
          .section-title::after {
            width: 80px;
          }
        }

        .description-content :global(h1) {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px dashed #e5e7eb;
        }

        @media (min-width: 640px) {
          .description-content :global(h1) {
            font-size: 1.25rem;
            margin-bottom: 1.25rem;
          }
        }

        .description-content :global(p) {
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        @media (min-width: 640px) {
          .description-content :global(p) {
            line-height: 1.7;
            margin-bottom: 1.25rem;
            font-size: 1rem;
          }
        }

        .features-container {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 1rem;
          margin: 1rem 0;
        }

        @media (min-width: 640px) {
          .features-container {
            border-radius: 8px;
            padding: 1.25rem;
            margin: 1.5rem 0;
          }
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          padding: 0.375rem 0;
          color: #374151;
          line-height: 1.5;
          font-size: 0.875rem;
        }

        @media (min-width: 640px) {
          .feature-item {
            padding: 0.5rem 0;
            line-height: 1.6;
            font-size: 1rem;
          }
        }

        .feature-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          margin-right: 0.5rem;
          font-size: 0.625rem;
          flex-shrink: 0;
        }

        @media (min-width: 640px) {
          .feature-icon {
            width: 20px;
            height: 20px;
            margin-right: 0.75rem;
            font-size: 0.75rem;
          }
        }

        .description-text {
          color: #4b5563;
          line-height: 1.6;
          margin-top: 1rem;
          font-size: 0.875rem;
        }

        @media (min-width: 640px) {
          .description-text {
            line-height: 1.7;
            margin-top: 1.25rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

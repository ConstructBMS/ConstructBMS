import type { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  footer?: ReactNode;
  footerClassName?: string;
  header?: ReactNode;
  headerClassName?: string;
  hover?: boolean;
  subtitle?: string;
  title?: string;
}

const Card = ({
  children,
  title,
  subtitle,
  header,
  footer,
  hover = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  footerClassName = ''
}: CardProps) => {
  const cardClasses = [
    'card',
    hover ? 'card-hover' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {(header || title) && (
        <div className={`card-header ${headerClassName}`}>
          {header || (
            <>
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="text-body-small text-muted">{subtitle}</p>}
            </>
          )}
        </div>
      )}
      
      <div className={`card-content ${contentClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`card-footer ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 

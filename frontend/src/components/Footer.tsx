import { getIconStrict } from '@/design/icons';
import type { FooterConfig, FooterWidget } from '@/types/footer';
import React from 'react';

interface FooterProps {
  config: FooterConfig;
}

const Footer: React.FC<FooterProps> = ({ config }) => {
  const getFormattingClasses = (
    formatting?: FooterWidget['formatting'],
    globalFormatting?: FooterConfig['globalFormatting']
  ) => {
    const format = formatting || globalFormatting || {};

    const textAlignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    };

    const fontSizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
    };

    const fontWeightClasses = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    };

    const lineHeightClasses = {
      tight: 'leading-tight',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
      loose: 'leading-loose',
    };

    return [
      format.textAlign ? textAlignClasses[format.textAlign] : '',
      format.fontSize ? fontSizeClasses[format.fontSize] : '',
      format.fontWeight ? fontWeightClasses[format.fontWeight] : '',
      format.lineHeight ? lineHeightClasses[format.lineHeight] : '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  const getWidgetAlignmentClasses = (
    formatting?: FooterWidget['formatting'],
    globalFormatting?: FooterConfig['globalFormatting']
  ) => {
    const format = formatting || globalFormatting || {};

    const widgetAlignClasses = {
      left: 'items-start',
      center: 'items-center',
      right: 'items-end',
    };

    return format.widgetAlign
      ? widgetAlignClasses[format.widgetAlign]
      : 'items-center';
  };

  const getHeaderAlignmentClasses = (
    formatting?: FooterWidget['formatting'],
    globalFormatting?: FooterConfig['globalFormatting']
  ) => {
    const format = formatting || globalFormatting || {};

    const headerAlignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    return format.headerAlign
      ? headerAlignClasses[format.headerAlign]
      : 'text-center';
  };

  const renderWidget = (widget: FooterWidget) => {
    const formattingClasses = getFormattingClasses(
      widget.formatting,
      config.globalFormatting
    );
    const widgetAlignmentClasses = getWidgetAlignmentClasses(
      widget.formatting,
      config.globalFormatting
    );
    const headerAlignmentClasses = getHeaderAlignmentClasses(
      widget.formatting,
      config.globalFormatting
    );

    switch (widget.type) {
      case 'text':
        return (
          <div className={`space-y-3 flex flex-col ${widgetAlignmentClasses}`}>
            <h3 className={`font-semibold text-lg ${headerAlignmentClasses}`}>
              {widget.title}
            </h3>
            <p className={`text-sm leading-relaxed ${formattingClasses}`}>
              {widget.content}
            </p>
          </div>
        );

      case 'html':
        return (
          <div className={`space-y-3 flex flex-col ${widgetAlignmentClasses}`}>
            <h3 className={`font-semibold text-lg ${headerAlignmentClasses}`}>
              {widget.title}
            </h3>
            <div
              className={`text-sm ${formattingClasses}`}
              dangerouslySetInnerHTML={{ __html: widget.content }}
            />
          </div>
        );

      case 'list': {
        const pages = widget.config?.pages || [];
        return (
          <div className={`space-y-3 flex flex-col ${widgetAlignmentClasses}`}>
            <h3 className={`font-semibold text-lg ${headerAlignmentClasses}`}>
              {widget.title}
            </h3>
            <ul className={`space-y-2 ${formattingClasses}`}>
              {pages.map((page: unknown, index: number) => (
                <li key={index}>
                  <a
                    href={page.url}
                    className='text-sm hover:underline transition-colors'
                  >
                    {page.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case 'contact':
        return (
          <div className={`space-y-3 flex flex-col ${widgetAlignmentClasses}`}>
            <h3 className={`font-semibold text-lg ${headerAlignmentClasses}`}>
              {widget.title}
            </h3>
            <div
              className={`space-y-2 text-sm flex flex-col ${widgetAlignmentClasses}`}
            >
              {widget.config?.address && (
                <div
                  className={`flex items-start space-x-2 ${formattingClasses}`}
                >
                  <span className='text-lg'>{getIconStrict('location')}</span>
                  <span>{widget.config.address}</span>
                </div>
              )}
              {widget.config?.phone && (
                <div
                  className={`flex items-center space-x-2 ${formattingClasses}`}
                >
                  <span className='text-lg'>{getIconStrict('phone')}</span>
                  <a
                    href={`tel:${widget.config.phone}`}
                    className='hover:underline'
                  >
                    {widget.config.phone}
                  </a>
                </div>
              )}
              {widget.config?.email && (
                <div
                  className={`flex items-center space-x-2 ${formattingClasses}`}
                >
                  <span className='text-lg'>{getIconStrict('email')}</span>
                  <a
                    href={`mailto:${widget.config.email}`}
                    className='hover:underline'
                  >
                    {widget.config.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        );

      case 'gallery': {
        const images = widget.config?.images || [];
        return (
          <div className={`space-y-3 flex flex-col ${widgetAlignmentClasses}`}>
            <h3 className={`font-semibold text-lg ${headerAlignmentClasses}`}>
              {widget.title}
            </h3>
            <div className={`grid grid-cols-2 gap-2 ${formattingClasses}`}>
              {images.map((image: unknown, index: number) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.alt || 'Gallery image'}
                  className='w-full h-20 object-cover rounded'
                />
              ))}
            </div>
          </div>
        );
      }

      case 'social': {
        const socialLinks = widget.config?.links || [];
        return (
          <div className={`space-y-3 flex flex-col ${widgetAlignmentClasses}`}>
            <h3 className={`font-semibold text-lg ${headerAlignmentClasses}`}>
              {widget.title}
            </h3>
            <div className={`flex space-x-3 ${formattingClasses}`}>
              {socialLinks.map((link: unknown, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-2xl hover:opacity-75 transition-opacity'
                >
                  {getIconStrict(link.platform)}
                </a>
              ))}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const getColumnClass = () => {
    switch (config.columns) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2';
    }
  };

  return (
    <footer
      className='w-full'
      style={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        padding: config.padding,
      }}
    >
      <div className='max-w-7xl mx-auto'>
        <div className={`grid ${getColumnClass()} gap-8`}>
          {config.widgets.map(widget => (
            <div key={widget.id}>{renderWidget(widget)}</div>
          ))}
        </div>

        {config.showCopyright && (
          <div
            className='border-t mt-8 pt-8 text-center text-sm'
            style={{ borderColor: config.accentColor }}
          >
            <p>{config.copyrightText}</p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;

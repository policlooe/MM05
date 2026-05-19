import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[];
}

export const SEO = ({ 
  title, 
  description, 
  image = '/og.png',
  url = 'https://mm05.vercel.app',
  type = 'website',
  keywords = []
}: SEOProps) => {
  const fullTitle = `${title} | MM05 — Мебель из массива`;
  const fullUrl = url.startsWith('http') ? url : `https://mm05.vercel.app${url}`;
  const fullImage = image.startsWith('http') ? image : `https://mm05.vercel.app${image}`;

  return (
    <Helmet>
      {/* Основные meta теги */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="MM05" />
      <meta property="og:locale" content="ru_RU" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
};

import { Helmet } from 'react-helmet-async';

interface HelmeTemplateProps {
  title: string;
}

export function HelmetTemplate({ title }: HelmeTemplateProps) {
  return (
    <Helmet>
      <title>{title}</title>

      {/* Add more for dynamic tags */}
    </Helmet>
  );
}

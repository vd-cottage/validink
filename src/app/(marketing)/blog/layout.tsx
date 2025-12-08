import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - ValidInk Email Validation Insights',
  description: 'Stay updated with the latest insights on email validation, deliverability best practices, and industry news from ValidInk.',
  keywords: 'email validation blog, email deliverability, email marketing tips, API updates',
  openGraph: {
    title: 'Blog - ValidInk',
    description: 'Email validation insights, best practices, and industry updates.',
    url: 'https://validink.com/blog',
    images: [
      {
        url: '/og-blog.png',
        width: 1200,
        height: 630,
        alt: 'ValidInk Blog',
      },
    ],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}

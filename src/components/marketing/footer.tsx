import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="text-muted-foreground hover:text-primary">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-muted-foreground hover:text-primary">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-primary">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ValidInk. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Powered by{' '}
            <a
              href="https://www.vdcottage.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              VDCottage
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl font-bold text-primary-foreground">PAP</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Public Accountability Platform</span>
                <span className="text-xs text-muted-foreground">Nepal</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              A civic tech initiative to promote transparency and accountability in Nepal.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cases" className="text-muted-foreground hover:text-primary transition-colors">
                  Cases
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/report" className="text-muted-foreground hover:text-primary transition-colors">
                  Report Allegation
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-muted-foreground hover:text-primary transition-colors">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Partners</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://LetsBuildNepal.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Let's Build Nepal (LBN)
                </a>
              </li>
              <li>
                <a 
                  href="https://NewNepal.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  NewNepal.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Public Accountability Platform Nepal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

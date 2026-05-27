import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <div className="max-w-md rounded-3xl border border-input bg-background/80 p-10 shadow-lg shadow-black/5 backdrop-blur-sm">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">404</p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-foreground">Page Not Found</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
          <a
            href="/"
            className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary/90"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

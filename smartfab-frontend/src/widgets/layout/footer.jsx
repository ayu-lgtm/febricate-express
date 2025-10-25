import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-tailwind/react";
import { HeartIcon } from "@heroicons/react/24/solid";

export function Footer({ 
  brandName = "Tata Steel 2025", 
  brandLink = "https://www.tatasteel.com/", 
  routes = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Privacy Policy", path: "/privacy" },
  ], 
  className = "" 
}) {
  const year = new Date().getFullYear();

  return (
    <footer className={`bg-gray-50 py-6 px-4 ${className}`}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand and copyright */}
          <Typography
            variant="h6" // You can also use "h5" or "h4" for larger text
            className="font-normal text-gray-600 text-center md:text-left"
          >
            
            <a href="/disclaimer" className="text-gray-600 hover:underline text-lg">Disclaimer</a> | 
            <a href="/privacy-policy" className="text-gray-600 hover:underline text-lg"> Privacy Policy</a> | 
            <a href="/cookie-policy" className="text-gray-600 hover:underline text-lg"> Cookie Policy</a> | 
            <a href="/sitemap" className="text-gray-600 hover:underline text-lg"> Sitemap</a> 
            <br />
            © Copyright {brandName}. All rights reserved.
          </Typography>

          {/* Navigation links */}
          <ul className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {routes.map(({ name, path }) => (
              <li key={name}>
                <Typography
                  as="a"
                  href={path}
                  variant="small"
                  className="font-normal text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {name}
                </Typography>
              </li>
            ))}
          </ul>
        </div>

        
      </div>
    </footer>
  );
}

Footer.propTypes = {
  brandName: PropTypes.string,
  brandLink: PropTypes.string,
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    })
  ),
  className: PropTypes.string,
};

Footer.defaultProps = {
  brandName: "Tata Steel 2025",
  brandLink: "https://www.tatasteel.com/",
  routes: [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Privacy Policy", path: "/privacy" },
  ],
  className: "",
};

Footer.displayName = "Footer";

export default Footer;
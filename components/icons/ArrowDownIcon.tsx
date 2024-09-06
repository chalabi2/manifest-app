import React from 'react';
import { SVGProps } from 'react';

const ArrowDownIcon: React.FC<SVGProps<SVGSVGElement>> = props => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8.96133 18.3939C8.32969 18.3939 7.87852 17.9182 7.87852 17.3521C7.87852 16.7943 8.3543 16.3514 8.94492 16.3514H11.9555L15.0234 16.458L13.5633 15.1619L6.04101 7.63145C5.81953 7.40996 5.69648 7.13105 5.69648 6.86035C5.69648 6.31074 6.20508 5.79395 6.77109 5.79395C7.0418 5.79395 7.3125 5.90879 7.53398 6.13848L15.0645 13.6607L16.3687 15.1209L16.2457 12.1678V9.04238C16.2457 8.45176 16.6887 7.96777 17.2629 7.96777C17.8289 7.96777 18.3047 8.44355 18.3047 9.05879L18.2965 17.2865C18.2965 17.9428 17.8617 18.3939 17.1891 18.3939H8.96133Z"
      fill="currentColor"
      className="fill-current"
    />
  </svg>
);

export default ArrowDownIcon;

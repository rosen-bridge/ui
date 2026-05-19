export const ICON = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="metal" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#d9d9d9"/>
      <stop offset="40%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#b3b3b3"/>
      <stop offset="100%" stop-color="#e6e6e6"/>
    </linearGradient>
  </defs>

  <!-- Cap -->
  <path d="M45 15h38l4 12H41l4-12z" fill="url(#metal)" stroke="#666" stroke-width="2"/>

  <!-- Neck -->
  <rect x="41" y="27" width="46" height="18" rx="3" fill="url(#metal)" stroke="#666" stroke-width="2"/>

  <!-- Body -->
  <path d="M32 45h64l-10 62c-1 6-5 10-10 10H52c-5 0-9-4-10-10L32 45z"
        fill="url(#metal)" stroke="#666" stroke-width="2"/>

  <!-- Shine highlight -->
  <path d="M48 50c-5 30 0 50 8 60" stroke="white" stroke-width="3" opacity="0.3"/>
</svg>
`;

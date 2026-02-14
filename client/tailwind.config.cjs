module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'primary-mint': '#a8dadc',
        'deep-ocean': '#457b9d',
        'accent-sand': '#f1faee',
        'text-dark': '#1d3557',
        'success-cta': '#e9c46a'
      },
      borderRadius: {
        '3xl': '1.5rem'
      },
      boxShadow: {
        'soft-lg': '0 10px 30px rgba(29,53,87,0.08)'
      }
    }
  },
  plugins: []
}

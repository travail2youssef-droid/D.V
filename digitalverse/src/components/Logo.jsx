
export default function Logo({ size = 'default', showText = true, className = '' }) {
  const width = showText ? (size === 'large' ? 250 : size === 'small' ? 160 : 195) : (size === 'large' ? 48 : 36);
  return <img src={showText ? '/assets/digitalverse-logo.png' : '/assets/digitalverse-emblem.png'} alt="DigitalVerse" width={width} height={showText ? Math.round(width * 169 / 906) : 36} className={`brand-logo ${className}`} style={{ width, maxWidth: '100%', height: 'auto', objectFit: 'contain' }} />;
}

import { hrefFor, isPlainClick, navigateToSection } from '../navigation';

/** Anchor to a section route; scrolls in-page on click, works as a real link otherwise. */
export default function SectionLink({ to, onNavigate, children, ...rest }) {
  const handleClick = (e) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    onNavigate?.();
    navigateToSection(to);
  };
  return (
    <a href={hrefFor(to)} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

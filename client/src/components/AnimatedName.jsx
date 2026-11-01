// Brand name with letter animations: letters rise in on load, a gold glint
// travels across them, and they wave on hover.
// Bengali is kept as one piece: splitting it into separate letters can break
// how the script joins its characters.
export default function AnimatedName({ text, lang }) {
  if (lang === 'bn') {
    return <span className="anim-name anim-name--whole" aria-label={text}>{text}</span>;
  }

  const letters = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map((s) => s.segment);
  return (
    <span className="anim-name" aria-label={text}>
      {letters.map((ch, i) => (
        <span key={i} className="anim-name__ch" style={{ '--i': i }} aria-hidden="true">
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  );
}

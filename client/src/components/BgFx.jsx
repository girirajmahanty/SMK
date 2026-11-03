// Moving background for a section, drawn behind its content: gold embers rising like sparks from a diya,
// stars twinkling like fireflies, soft glows drifting like morning light, and a faint alpana slowly turning.
// Positions and timings are spread by index (no randomness), so every visit looks the same.
export default function BgFx({ embers = 0, stars = 0, glows = false, alpana = false, className = '' }) {
  return (
    <span className={`bgfx ${className}`} aria-hidden="true">
      {glows && (
        <>
          <span className="bgfx__glow bgfx__glow--1" />
          <span className="bgfx__glow bgfx__glow--2" />
          <span className="bgfx__glow bgfx__glow--3" />
        </>
      )}
      {alpana && <span className="bgfx__alpana" />}
      {Array.from({ length: embers }, (_, i) => (
        <span key={`e${i}`} className="bgfx__ember" style={{
          '--x': `${(i * 37 + 11) % 100}%`, '--y': `${55 + ((i * 23) % 45)}%`, '--d': `${((i * 1.7) % 9).toFixed(1)}s`,
          '--t': `${9 + ((i * 3) % 7)}s`, '--s': `${2 + (i % 3)}px`, '--dx': `${((i * 13) % 40) - 20}px`,
        }} />
      ))}
      {Array.from({ length: stars }, (_, i) => (
        <span key={`s${i}`} className="bgfx__star" style={{
          '--x': `${(i * 53 + 7) % 100}%`, '--y': `${(i * 29 + 13) % 92}%`, '--d': `${((i * 0.9) % 5).toFixed(1)}s`, '--t': `${2.5 + (i % 4)}s`,
        }} />
      ))}
    </span>
  );
}

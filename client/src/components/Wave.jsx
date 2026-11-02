// Curved divider at the top of a section, filled with the colour of the section above it.
// Two layered waves with a thin gold edge.
let edge = 'M0,40 Q180,72 360,40';
for (let x = 360; x < 2880; x += 360) edge += ` T${x + 360},40`;
const shape = `${edge} L2880,0 L0,0 Z`;

export default function Wave({ fill, flip = false }) {
  return (
    <div className={`wave ${flip ? 'wave--flip' : ''}`} style={{ '--wave-fill': fill }} aria-hidden="true">
      <svg className="wave__layer wave__layer--back" viewBox="0 0 2880 80" preserveAspectRatio="none"><path d={shape} /></svg>
      <svg className="wave__layer wave__layer--front" viewBox="0 0 2880 80" preserveAspectRatio="none">
        <path d={shape} />
        <path className="wave__edge" d={edge} />
      </svg>
    </div>
  );
}

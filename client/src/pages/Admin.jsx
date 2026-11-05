import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowDown, ArrowLeft, ArrowUp, Check, ChevronRight, CircleAlert, Clock3, Eye, FileText,
  BookOpen, CloudRain, Drum, Flame, ImagePlus, Images, Landmark, LayoutDashboard, LoaderCircle, LogOut, Menu, MoonStar, Plus, Search,
  ShoppingBasket, Soup, Sprout, Sun, Sunrise, Swords, UtensilsCrossed, Wheat,
  Settings2, ShieldCheck, Sparkles, Trash2, Upload, X,
} from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { useLang, publicTextDefaults } from '../i18n.jsx';
import { api } from '../api.js';
import { village } from '../village.js';
import './admin.css';

const VILLAGE_FIELDS = [
  ['village.subtitle', 'Village location line', village.subtitle],
  ['village.heroLine', 'Homepage introduction', village.heroLine],
  ['village.storyQuote', 'Village story quotation', village.storyQuote],
  ...village.story.map((item, index) => [`village.story.${index}`, `About village · paragraph ${index + 1}`, item]),
  ['village.established', 'Village heritage · established year', { en: String(village.established), bn: String(village.established) }, 'number'],
  ...['founded', 'families', 'population'].map((key) => [`village.${key}`, `Village information · ${key}`, { en: village[key] == null ? '' : String(village[key]), bn: village[key] == null ? '' : String(village[key]) }, 'number']),
  ...village.life.flatMap((item, index) => [
    [`village.life.${index}.title`, `Village life · card ${index + 1} title`, item.title],
    [`village.life.${index}.text`, `Village life · card ${index + 1} description`, item.text],
  ]),
  ...village.gallery.map((item, index) => [`village.gallery.${index}.caption`, `Gallery photo ${index + 1} caption`, item.caption]),
  ['village.storyImages.main.caption', 'About section · main photo caption', village.storyImages.main.caption],
  ['village.storyImages.side.caption', 'About section · secondary photo caption', village.storyImages.side.caption],
  ['village.address', 'Village address', village.address],
].map((item) => [item[0], item[1], item[2], item[3] || 'text']);
const IMAGE_FIELDS = [
  ['village.heroImage', 'Homepage hero image', village.heroImage],
  ['village.storyImages.main.src', 'About section main image', village.storyImages.main.src],
  ['village.storyImages.side.src', 'About section secondary image', village.storyImages.side.src],
  ...village.gallery.map((item, index) => [`village.gallery.${index}.src`, `Gallery photo ${index + 1}`, item.src]),
  ...village.life.map((item, index) => [`village.life.${index}.img`, `Village life · card ${index + 1} image`, item.img || '']),
];
const CONTENT_FIELDS = [
  ...Object.entries(publicTextDefaults).map(([key, value]) => ({ key, label: key, value, kind: 'text' })),
  ...VILLAGE_FIELDS.map(([key, label, value, kind]) => ({ key, label, value, kind })),
  ...IMAGE_FIELDS.map(([key, label, value]) => ({ key, label, value: { en: value || '', bn: value || '' }, kind: 'image' })),
];
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'festivals', label: 'Festivals', icon: Flame },
  { id: 'content', label: 'Website content', icon: FileText },
  { id: 'media', label: 'Media library', icon: Images },
  { id: 'activity', label: 'Activity', icon: Clock3 },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];
const EMPTY_FESTIVAL = {
  name: { en: '', bn: '' }, date: { en: '', bn: '' }, text: { en: '', bn: '' },
  details: [], tone: 'kali', icon: 'Flame', img: '', position: '', featured: true, published: true,
  startDate: '', endDate: '', order: 0,
};
const prettyKey = (key) => key.split('.').slice(0, -1).join(' · ') || 'Website copy';
const formatDate = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : '—';

export function AdminGate({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="admin-screen-state"><LoaderCircle className="admin-spin" /> Checking your admin session…</div>;
  if (user?.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
}

export function AdminLogin() {
  const { user, ready, login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (ready && user?.role === 'admin') return <Navigate to="/admin" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const signedIn = await login(email, password);
      if (signedIn?.role !== 'admin') {
        await logout();
        throw new Error('This account does not have administrator access.');
      }
      navigate('/admin', { replace: true });
    } catch (reason) {
      setError(reason.message || 'Unable to sign in. Check your credentials and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="admin-login">
      <div className="admin-login__art" aria-hidden="true">
        <div className="admin-login__seal">SG</div>
        <p>SIDHAGORA · PURULIA</p>
        <h1>Rooted in<br />heritage.</h1>
        <span>A thoughtful home for the stories, celebrations, and people of our village.</span>
      </div>
      <div className="admin-login__form">
        <Link to="/" className="admin-back"><ArrowLeft /> Back to website</Link>
        <div className="admin-brand-mark"><ShieldCheck /></div>
        <p className="admin-kicker">SECURE ADMINISTRATION</p>
        <h2>Welcome back</h2>
        <p className="admin-muted">Sign in to manage the Sidhagora website.</p>
        <form onSubmit={submit}>
          <label>Email address<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {error && <p className="admin-alert" role="alert"><CircleAlert /> {error}</p>}
          <button className="admin-button admin-button--primary admin-login__submit" disabled={busy}>
            {busy ? <LoaderCircle className="admin-spin" /> : <ShieldCheck />} {busy ? 'Signing in…' : 'Sign in securely'}
          </button>
        </form>
        <p className="admin-login__foot"><ShieldCheck /> Protected by server-side administrator access.</p>
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, detail, accent }) {
  return (
    <article className={`admin-stat admin-stat--${accent}`}>
      <span className="admin-stat__icon"><Icon /></span>
      <p>{label}</p>
      <strong>{value ?? '—'}</strong>
      <small>{detail}</small>
    </article>
  );
}

function LocalizedPair({ label, value = {}, onChange, multiline = false }) {
  const Control = multiline ? 'textarea' : 'input';
  return (
    <fieldset className="admin-localized">
      <legend>{label}</legend>
      <label><span>English</span><Control value={value.en || ''} onChange={(event) => onChange({ ...value, en: event.target.value })} /></label>
      <label><span>বাংলা</span><Control lang="bn" value={value.bn || ''} onChange={(event) => onChange({ ...value, bn: event.target.value })} /></label>
    </fieldset>
  );
}

function FestivalEditor({ festival, media, onClose, onSave }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_FESTIVAL, ...(festival || {}), name: { ...EMPTY_FESTIVAL.name, ...festival?.name }, date: { ...EMPTY_FESTIVAL.date, ...festival?.date }, text: { ...EMPTY_FESTIVAL.text, ...festival?.text } }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const saved = await onSave(form);
      if (!saved) {
        setError('Festival changes could not be saved. Please review the dashboard alert and try again.');
        return;
      }
      onClose();
    } catch (reason) {
      setError(reason.message || 'Unable to save this festival.');
    } finally {
      setSaving(false);
    }
  };

  const editDetails = (locale, value) => {
    const lines = value.split('\n');
    const length = Math.max(lines.length, form.details.length);
    const details = Array.from({ length }, (_, index) => ({
      en: locale === 'en' ? (lines[index] || '') : (form.details[index]?.en || ''),
      bn: locale === 'bn' ? (lines[index] || '') : (form.details[index]?.bn || ''),
    })).filter((item) => item.en || item.bn);
    change('details', details);
  };

  return (
    <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="festival-editor-title">
        <header><div><p className="admin-kicker">FESTIVAL WORKSPACE</p><h2 id="festival-editor-title">{festival ? 'Edit festival' : 'Create festival'}</h2></div><button className="admin-icon-button" onClick={onClose} aria-label="Close"><X /></button></header>
        <form onSubmit={save} className="admin-form">
          <LocalizedPair label="Festival name" value={form.name} onChange={(value) => change('name', value)} />
          <LocalizedPair label="Traditional date / date label" value={form.date} onChange={(value) => change('date', value)} />
          <LocalizedPair label="Description and traditions" value={form.text} onChange={(value) => change('text', value)} multiline />
          <div className="admin-form-grid">
            <label>First day<input type="date" value={form.startDate || ''} onChange={(event) => change('startDate', event.target.value)} /></label>
            <label>Last day<input type="date" value={form.endDate || ''} min={form.startDate || undefined} onChange={(event) => change('endDate', event.target.value)} /></label>
            <label>Festival symbol<select value={form.icon || 'Flame'} onChange={(event) => change('icon', event.target.value)}>{['Flame', 'Wheat', 'Landmark', 'Drum', 'Soup', 'ShoppingBasket', 'Sun', 'Swords', 'UtensilsCrossed', 'CloudRain', 'Sprout', 'MoonStar', 'Sunrise', 'BookOpen'].map((icon) => <option key={icon}>{icon}</option>)}</select></label>
            <label>Festival image<select value={form.img || ''} onChange={(event) => change('img', event.target.value)}><option value="">Use the existing card artwork</option>{media.map((item) => <option value={item.url} key={item.id}>{item.caption || item.filename}</option>)}</select></label>
          </div>
          <div className="admin-form-grid admin-form-grid--flags">
            <label className="admin-check"><input type="checkbox" checked={form.published !== false} onChange={(event) => change('published', event.target.checked)} /> Published on the website</label>
          </div>
          <div className="admin-form-grid admin-form-grid--rituals">
            <label>Traditions / rituals (English, one per line)<textarea value={form.details.map((item) => item.en).join('\n')} onChange={(event) => editDetails('en', event.target.value)} /></label>
            <label>রীতি ও ঐতিহ্য (প্রতি লাইনে একটি)<textarea lang="bn" value={form.details.map((item) => item.bn).join('\n')} onChange={(event) => editDetails('bn', event.target.value)} /></label>
          </div>
          {error && <p className="admin-alert" role="alert"><CircleAlert /> {error}</p>}
          <footer><button type="button" className="admin-button" onClick={onClose}>Cancel</button><button className="admin-button admin-button--primary" disabled={saving}>{saving ? <LoaderCircle className="admin-spin" /> : <Check />} {saving ? 'Saving…' : 'Save festival'}</button></footer>
        </form>
      </section>
    </div>
  );
}

function ContentWorkspace({ records, media, onSave, onReset }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [pending, setPending] = useState({});
  const fields = useMemo(() => CONTENT_FIELDS.filter((field) => {
    const matchesText = `${field.key} ${field.label}`.toLowerCase().includes(query.toLowerCase());
    const group = prettyKey(field.key);
    return matchesText && (category === 'all' || group.startsWith(category));
  }), [query, category]);

  return (
    <>
    <GalleryManager records={records} media={media} onSave={onSave} onDelete={onReset} />
    <section className="admin-panel">
      <div className="admin-panel__heading"><div><p className="admin-kicker">PUBLISHED WEBSITE COPY</p><h2>Website content</h2><p>Update bilingual copy and key village information without editing source files.</p></div><span className="admin-count">{fields.length} fields</span></div>
      <div className="admin-toolbar"><label className="admin-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search headings, paragraphs, labels…" /></label><select aria-label="Filter content group" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All sections</option>{['announcement', 'hero', 'story', 'life', 'gallery', 'fest', 'visit', 'footer', 'nav', 'village'].map((item) => <option value={item} key={item}>{item === 'village' ? 'Village information' : item === 'announcement' ? 'Announcements' : item.charAt(0).toUpperCase() + item.slice(1)}</option>)}</select></div>
      <div className="admin-content-list">
        {fields.map((field) => {
          const current = records[field.key] || field.value;
          const hasCustom = !!records[field.key];
          const editing = pending[field.key] || current;
          return (
            <article className="admin-content-row" key={field.key}>
              <div className="admin-content-row__title"><span>{field.kind === 'image' ? <Images /> : <FileText />}</span><div><strong>{field.label}</strong><small>{field.key}{hasCustom && <em> · Published override</em>}</small></div></div>
              {field.kind === 'image' ? (
                <div className="admin-image-field">
                  <select value={editing.en || ''} onChange={(event) => setPending((state) => ({ ...state, [field.key]: { en: event.target.value, bn: event.target.value } }))}><option value="">Use the original website image</option>{media.map((item) => <option key={item.id} value={item.url}>{item.caption || item.filename}</option>)}{editing.en && !media.some((item) => item.url === editing.en) && <option value={editing.en}>Current image</option>}</select>
                  {editing.en && <img src={editing.en} alt="" />}
                </div>
              ) : field.kind === 'number' ? (
                <div className="admin-content-row__inputs"><label><span>Year / count</span><input type="number" min="1" value={editing.en || ''} onChange={(event) => setPending((state) => ({ ...state, [field.key]: { en: event.target.value, bn: event.target.value } }))} /></label></div>
              ) : (
                <div className="admin-content-row__inputs">
                  <label><span>English</span><textarea value={editing.en || ''} onChange={(event) => setPending((state) => ({ ...state, [field.key]: { ...editing, en: event.target.value } }))} /></label>
                  <label><span>বাংলা</span><textarea lang="bn" value={editing.bn || ''} onChange={(event) => setPending((state) => ({ ...state, [field.key]: { ...editing, bn: event.target.value } }))} /></label>
                </div>
              )}
              <div className="admin-content-row__actions">
                <button className="admin-button admin-button--small admin-button--primary" onClick={async () => { const result = await onSave(field.key, editing); if (result) setPending((state) => { const next = { ...state }; delete next[field.key]; return next; }); }}>Save changes</button>
                {hasCustom && <button className="admin-button admin-button--small" onClick={async () => { if (window.confirm(`Restore the original text for "${field.label}"?`)) await onReset(field.key); }} aria-label={`Restore default ${field.label}`}>Restore default</button>}
              </div>
            </article>
          );
        })}
        {!fields.length && <div className="admin-empty"><Search /><h3>No matching content</h3><p>Try a different search or section filter.</p></div>}
      </div>
    </section>
    </>
  );
}

function GalleryManager({ records, media, onSave, onDelete }) {
  const [form, setForm] = useState({ src: '', cat: 'village', caption: { en: '', bn: '' } });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const items = Object.entries(records)
    .filter(([key]) => key.startsWith('village.gallery.custom.'))
    .map(([key, value]) => {
      try { return { key, item: JSON.parse(value.en) }; } catch { return null; }
    }).filter(Boolean);

  const addPhoto = async (event) => {
    event.preventDefault();
    if (!form.src || !form.caption.en.trim() || !form.caption.bn.trim()) {
      setError('Choose an image and add captions in both languages.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const key = `village.gallery.custom.${crypto.randomUUID()}`;
      const success = await onSave(key, { en: JSON.stringify({ ...form, w: 768, h: 1024 }), bn: '' });
      if (success) setForm({ src: '', cat: 'village', caption: { en: '', bn: '' } });
      else setError('The photo could not be added. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <section className="admin-panel admin-gallery-manager">
    <div className="admin-panel__heading"><div><p className="admin-kicker">GALLERY COLLECTION</p><h2>Manage gallery photos</h2><p>Add a photo to the existing public gallery design, or remove a CMS-added photo.</p></div><span className="admin-count">{items.length} added</span></div>
    <form className="admin-gallery-form" onSubmit={addPhoto}>
      <label>Photo from media library<select value={form.src} onChange={(event) => setForm((current) => ({ ...current, src: event.target.value }))} required><option value="">Choose an uploaded image</option>{media.map((item) => <option key={item.id} value={item.url}>{item.caption || item.filename}</option>)}</select></label>
      <label>Gallery category<select value={form.cat} onChange={(event) => setForm((current) => ({ ...current, cat: event.target.value }))}><option value="village">Village</option><option value="temple">Temple</option><option value="procession">Kali Puja</option></select></label>
      <LocalizedPair label="Photo caption" value={form.caption} onChange={(caption) => setForm((current) => ({ ...current, caption }))} />
      {error && <p className="admin-alert" role="alert"><CircleAlert />{error}</p>}
      <button className="admin-button admin-button--primary" disabled={busy || !media.length}>{busy ? <LoaderCircle className="admin-spin" /> : <Plus />} Add to gallery</button>
    </form>
    {!!items.length && <div className="admin-gallery-added">{items.map(({ key, item }) => <article key={key}><img src={item.src} alt="" /><div><strong>{item.caption.en}</strong><small lang="bn">{item.caption.bn}</small></div><button className="admin-icon-button admin-danger" onClick={() => { if (window.confirm(`Remove "${item.caption.en}" from the gallery?`)) onDelete(key); }} aria-label={`Remove ${item.caption.en}`}><Trash2 /></button></article>)}</div>}
  </section>;
}

function FestivalWorkspace({ festivals, media, onCreate, onUpdate, onDelete, onReorder }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(undefined);
  const shown = festivals.filter((item) =>
    `${item.name.en} ${item.name.bn}`.toLowerCase().includes(query.toLowerCase())
    && (filter === 'all' || (filter === 'published' ? item.published !== false : item.published === false)));

  return (
    <section className="admin-panel">
      <div className="admin-panel__heading"><div><p className="admin-kicker">CARD MANAGEMENT</p><h2>Festivals & traditions</h2><p>The public festival cards keep their existing visual design, countdown, and calendar behavior.</p></div><button className="admin-button admin-button--primary" onClick={() => setEditing(null)}><Plus /> Add festival</button></div>
      <div className="admin-toolbar"><label className="admin-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search festivals in English or Bengali" /></label><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter festivals"><option value="all">All festivals</option><option value="published">Published</option><option value="draft">Drafts</option></select></div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Festival</th><th>Visibility</th><th>Dates</th><th>Updated</th><th>Order</th><th><span className="admin-sr-only">Actions</span></th></tr></thead><tbody>
        {shown.map((festival) => {
          const actualIndex = festivals.findIndex((item) => item.id === festival.id);
          return <tr key={festival.id}><td><div className="admin-festival-cell">{festival.img ? <img src={festival.img} alt="" /> : <span className="admin-festival-cell__icon"><Flame /></span>}<div><strong>{festival.name.en}</strong><small lang="bn">{festival.name.bn}</small></div></div></td><td><span className={`admin-status ${festival.published === false ? 'is-draft' : ''}`}><i />{festival.published === false ? 'Draft' : 'Live'}</span></td><td>{festival.startDate || festival.date?.en || 'Date not set'}</td><td>{formatDate(festival.updatedAt || festival.createdAt)}</td><td className="admin-order-cell"><button disabled={actualIndex === 0} onClick={() => onReorder(actualIndex, -1)} aria-label={`Move ${festival.name.en} up`}><ArrowUp /></button><button disabled={actualIndex === festivals.length - 1} onClick={() => onReorder(actualIndex, 1)} aria-label={`Move ${festival.name.en} down`}><ArrowDown /></button></td><td><div className="admin-row-actions"><button className="admin-button admin-button--small" onClick={() => setEditing(festival)}>Edit</button><button className="admin-icon-button admin-danger" onClick={() => { if (window.confirm(`Permanently delete ${festival.name.en}? This cannot be undone.`)) onDelete(festival); }} aria-label={`Delete ${festival.name.en}`}><Trash2 /></button></div></td></tr>;
        })}
      </tbody></table>
      {!shown.length && <div className="admin-empty"><Flame /><h3>No festivals found</h3><p>Add a festival or adjust your filters.</p></div>}</div>
      {editing !== undefined && <FestivalEditor festival={editing || undefined} media={media} onClose={() => setEditing(undefined)} onSave={(form) => editing ? onUpdate(editing.id, form) : onCreate(form)} />}
    </section>
  );
}

function MediaWorkspace({ media, onUpload, onCaption, onDelete, onReplace }) {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const upload = async (event) => {
    event.preventDefault();
    setError('');
    if (!file) return setError('Choose an image to upload.');
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      return setError('Choose a PNG, JPG, GIF, or WebP image smaller than 3 MB.');
    }
    setUploading(true);
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('The image could not be read.'));
        reader.readAsDataURL(file);
      });
      const uploaded = await onUpload({ data, caption });
      if (!uploaded) {
        setError('The upload could not be completed. Please review the dashboard alert and try again.');
        return;
      }
      setCaption('');
      setFile(null);
      event.target.reset();
    } catch (reason) {
      setError(reason.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel__heading"><div><p className="admin-kicker">IMAGE COLLECTION</p><h2>Media library</h2><p>Validated images are stored on the server and can be used by festival and homepage content.</p></div><span className="admin-count">{media.length} images</span></div>
      <form className="admin-upload" onSubmit={upload}>
        <div className="admin-upload__icon"><ImagePlus /></div><div className="admin-upload__copy"><strong>Add an image</strong><span>PNG, JPG, GIF, or WebP · up to 3 MB</span></div>
        <label className="admin-file"><Upload /> Choose image<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} />{file && <span>{file.name}</span>}</label>
        <input className="admin-caption-input" aria-label="Image caption" placeholder="Optional caption" value={caption} onChange={(event) => setCaption(event.target.value)} />
        <button className="admin-button admin-button--primary" disabled={uploading}>{uploading ? <LoaderCircle className="admin-spin" /> : <Plus />} Upload</button>
        {error && <p className="admin-alert" role="alert"><CircleAlert /> {error}</p>}
      </form>
      {!media.length ? <div className="admin-empty"><Images /><h3>Your media library is ready</h3><p>Upload an image to use it on the website.</p></div> : <div className="admin-media-grid">{media.map((item) => <MediaCard key={item.id} item={item} onCaption={onCaption} onDelete={onDelete} onReplace={onReplace} />)}</div>}
    </section>
  );
}

function MediaCard({ item, onCaption, onDelete, onReplace }) {
  const [caption, setCaption] = useState(item.caption || '');
  const [replacing, setReplacing] = useState(false);
  return (
    <article className="admin-media-card">
      <div className="admin-media-card__image"><img src={item.url} alt={item.caption || ''} loading="lazy" /><span>{Math.max(1, Math.round(item.size / 1024))} KB</span></div>
      <label>Caption<input value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={300} /></label>
      <div className="admin-media-card__actions"><button className="admin-button admin-button--small" onClick={() => onCaption(item, caption)}>Save caption</button><label className="admin-button admin-button--small admin-file--replace">{replacing ? 'Replace…' : 'Replace'}<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={async (event) => { const nextFile = event.target.files?.[0]; if (!nextFile) return; setReplacing(true); try { await onReplace(item, nextFile); } finally { setReplacing(false); event.target.value = ''; } }} /></label><button className="admin-icon-button admin-danger" onClick={() => { if (window.confirm('Delete this image permanently? Images currently used by content cannot be deleted.')) onDelete(item); }} aria-label={`Delete ${item.filename}`}><Trash2 /></button></div>
    </article>
  );
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const { refreshCmsContent } = useLang();
  const navigate = useNavigate();
  const [section, setSection] = useState('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [overview, setOverview] = useState({ stats: {}, activities: [] });
  const [festivals, setFestivals] = useState([]);
  const [content, setContent] = useState({});
  const [media, setMedia] = useState([]);

  const reload = async () => {
    setError('');
    try {
      const [nextOverview, festivalResult, nextContent, nextMedia] = await Promise.all([
        api.adminOverview(), api.adminFestivals(), api.adminContent(), api.adminMedia(),
      ]);
      if (!festivalResult.initialized) {
        const initial = village.festivals.map((festival, order) => ({
          ...festival, order, published: true, startDate: '', endDate: '',
          icon: Object.entries({ Flame, Wheat, Landmark, Drum, Soup, ShoppingBasket, Sun, Swords, UtensilsCrossed, CloudRain, Sprout, MoonStar, Sunrise, BookOpen })
            .find(([, Icon]) => Icon === festival.Icon)?.[0] || 'Flame',
        }));
        await api.initializeFestivals(initial);
        const [updatedFestivals, updatedOverview] = await Promise.all([api.adminFestivals(), api.adminOverview()]);
        setFestivals(updatedFestivals.festivals);
        setOverview(updatedOverview);
      } else {
        setFestivals(festivalResult.festivals);
        setOverview(nextOverview);
      }
      setContent(Object.fromEntries(nextContent.map((item) => [item.key, { en: item.en, bn: item.bn }])));
      setMedia(nextMedia);
    } catch (reason) {
      setError(reason.message || 'Dashboard data could not be loaded.');
      if (reason.status === 401) {
        await logout();
        navigate('/admin/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const perform = async (task, successMessage) => {
    setError('');
    try {
      await task();
      await reload();
      setToast(successMessage);
      return true;
    } catch (reason) {
      setError(reason.message || 'That change could not be saved.');
      if (reason.status === 401) {
        await logout();
        navigate('/admin/login', { replace: true });
      }
      return false;
    }
  };
  const saveContent = async (key, value) => {
    const ok = await perform(async () => {
      await api.saveContent(key, value);
      await refreshCmsContent();
      setContent((current) => ({ ...current, [key]: value }));
    }, 'Website content saved');
    return ok;
  };
  const resetContent = (key) => perform(async () => {
    await api.resetContent(key);
    await refreshCmsContent();
    setContent((current) => { const next = { ...current }; delete next[key]; return next; });
  }, 'Original website content restored');
  const createFestival = (value) => perform(async () => { await api.createFestival(value); }, 'Festival created');
  const updateFestival = (id, value) => perform(async () => { await api.updateFestival(id, value); }, 'Festival updated');
  const deleteFestival = (item) => perform(async () => { await api.deleteFestival(item.id); }, 'Festival deleted');
  const reorderFestival = (index, direction) => perform(async () => {
    const reordered = [...festivals];
    const next = index + direction;
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    await api.reorderFestivals(reordered.map((item) => item.id));
  }, 'Festival order updated');
  const uploadMedia = (value) => perform(async () => { await api.uploadMedia(value); }, 'Image uploaded');
  const captionMedia = (item, caption) => perform(async () => { await api.updateMedia(item.id, caption); }, 'Image caption updated');
  const removeMedia = (item) => perform(async () => { await api.deleteMedia(item.id); }, 'Image deleted');
  const replaceMedia = async (item, file) => {
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      setError('Choose a PNG, JPG, GIF, or WebP image smaller than 3 MB.');
      return;
    }
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('The image could not be read.'));
      reader.readAsDataURL(file);
    });
    const replaced = await perform(async () => { await api.replaceMedia(item.id, { data }); }, 'Image replaced');
    if (replaced) await refreshCmsContent();
  };
  const signOut = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };
  const pageTitle = NAV_ITEMS.find((item) => item.id === section)?.label;
  const activities = overview.activities || [];

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${mobileNav ? 'is-open' : ''}`}>
        <Link className="admin-logo" to="/"><span>SG</span><div><strong>Sidhagora</strong><small>CONTENT STUDIO</small></div></Link>
        <p className="admin-side-label">WORKSPACE</p>
        <nav aria-label="Admin navigation">{NAV_ITEMS.map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? 'is-active' : ''} onClick={() => { setSection(id); setMobileNav(false); }}><Icon /><span>{label}</span>{id === 'festivals' && <small>{overview.stats?.festivals || ''}</small>}</button>)}</nav>
        <div className="admin-sidebar__bottom"><div className="admin-account"><span>{(user?.name || 'A').slice(0, 1).toUpperCase()}</span><div><strong>{user?.name}</strong><small>Administrator</small></div></div><button className="admin-side-logout" onClick={signOut}><LogOut /> Sign out</button></div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar"><button className="admin-mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation">{mobileNav ? <X /> : <Menu />}</button><div className="admin-breadcrumb"><span>Admin</span><ChevronRight /><strong>{pageTitle}</strong></div><div className="admin-topbar__right"><span className="admin-live"><i /> Live site</span><a href="/" target="_blank" rel="noreferrer"><Eye /> Preview</a><span className="admin-avatar">{(user?.name || 'A').slice(0, 1).toUpperCase()}</span></div></header>
        <main className="admin-workspace">
          <div className="admin-welcome"><div><p className="admin-kicker">{new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(new Date()).toUpperCase()} · SIDHAGORA, PURULIA</p><h1>{section === 'overview' ? `Good to see you, ${(user?.name || 'Admin').split(' ')[0]}.` : pageTitle}</h1><p>Manage your village website with care and confidence.</p></div><span><Sparkles /> A village of heritage, culture & festivals</span></div>
          {error && <div className="admin-alert admin-alert--banner" role="alert"><CircleAlert />{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X /></button></div>}
          {loading ? <div className="admin-loading"><LoaderCircle className="admin-spin" /><span>Loading your workspace…</span></div> : (
            <>
              {section === 'overview' && <Overview stats={overview.stats || {}} activities={activities} navigate={setSection} />}
              {section === 'festivals' && <FestivalWorkspace festivals={festivals} media={media} onCreate={createFestival} onUpdate={updateFestival} onDelete={deleteFestival} onReorder={reorderFestival} />}
              {section === 'content' && <ContentWorkspace records={content} media={media} onSave={saveContent} onReset={resetContent} />}
              {section === 'media' && <MediaWorkspace media={media} onUpload={uploadMedia} onCaption={captionMedia} onDelete={removeMedia} onReplace={replaceMedia} />}
              {section === 'activity' && <ActivityWorkspace activities={activities} />}
              {section === 'settings' && <SettingsWorkspace user={user} onLogout={signOut} />}
            </>
          )}
        </main>
        <footer className="admin-footer"><span>SIDHAGORA ADMIN STUDIO</span><span>Content is saved securely to your website database.</span></footer>
      </div>
      {mobileNav && <button aria-label="Close navigation" className="admin-sidebar-scrim" onClick={() => setMobileNav(false)} />}
      {toast && <div className="admin-toast" role="status"><Check /> {toast}</div>}
    </div>
  );
}

export default AdminDashboard;

function Overview({ stats, activities, navigate }) {
  const quickActions = [
    { title: 'Add a festival', text: 'Create a new festival card', section: 'festivals', icon: Flame },
    { title: 'Edit website copy', text: 'Update Bengali or English text', section: 'content', icon: FileText },
    { title: 'Upload an image', text: 'Add a photo to your media library', section: 'media', icon: ImagePlus },
  ];
  return <>
    <div className="admin-stat-grid">
      <StatCard icon={Flame} label="Festival cards" value={stats.festivals ?? 0} detail="Published and draft cards" accent="gold" />
      <StatCard icon={FileText} label="Content overrides" value={stats.content ?? 0} detail="Bilingual website fields saved" accent="blue" />
      <StatCard icon={Images} label="Library images" value={stats.media ?? 0} detail="Validated server uploads" accent="green" />
      <StatCard icon={Clock3} label="Recent actions" value={activities.length} detail="Latest admin events available" accent="plum" />
    </div>
    <section className="admin-panel admin-quick"><div className="admin-panel__heading"><div><p className="admin-kicker">MAKE SOMETHING HAPPEN</p><h2>Quick actions</h2></div></div><div className="admin-quick-grid">{quickActions.map(({ title, text, section, icon: Icon }) => <button key={title} onClick={() => navigate(section)}><span><Icon /></span><strong>{title}</strong><small>{text}</small><ChevronRight /></button>)}</div></section>
    <div className="admin-overview-grid">
      <section className="admin-panel"><div className="admin-panel__heading"><div><p className="admin-kicker">LATEST CHANGES</p><h2>Recently updated</h2></div><button className="admin-text-button" onClick={() => navigate('content')}>Edit content <ChevronRight /></button></div><RecentContent items={stats.recent || []} /></section>
      <section className="admin-panel"><div className="admin-panel__heading"><div><p className="admin-kicker">ADMINISTRATIVE HISTORY</p><h2>Recent activity</h2></div><button className="admin-text-button" onClick={() => navigate('activity')}>View all <ChevronRight /></button></div><ActivityList items={activities.slice(0, 5)} /></section>
      <section className="admin-panel admin-note"><span><ShieldCheck /></span><p className="admin-kicker">YOUR CMS IS READY</p><h2>Keep every detail close to home.</h2><p>Published updates are reflected on the public website. Festival cards retain their original look, countdowns, and calendar links.</p><div><span><Check /> English + বাংলা</span><span><Check /> Secure admin access</span></div></section>
    </div>
  </>;
}

function RecentContent({ items }) {
  if (!items.length) return <div className="admin-empty admin-empty--compact"><FileText /><h3>No updated content yet</h3><p>Published content changes will be listed here.</p></div>;
  return <ul className="admin-activity-list">{items.map((item, index) => {
    const festival = !!item.name;
    return <li key={`${item.id || item.key || 'content'}-${index}`}><span className="admin-activity-icon">{festival ? <Flame /> : <FileText />}</span><div><strong>{festival ? item.name.en : item.key}</strong><small>{festival ? 'Festival card' : 'Website content'}</small></div><time>{formatDate(item.updatedAt)}</time></li>;
  })}</ul>;
}

function ActivityList({ items }) {
  if (!items.length) return <div className="admin-empty admin-empty--compact"><Clock3 /><h3>No activity yet</h3><p>Changes will appear here as you manage your site.</p></div>;
  return <ul className="admin-activity-list">{items.map((item) => <li key={item.id}><span className="admin-activity-icon"><Check /></span><div><strong>{item.action}</strong><small>{item.target || 'Website settings'} · {item.actor}</small></div><time>{formatDate(item.createdAt)}</time></li>)}</ul>;
}

function ActivityWorkspace({ activities }) {
  return <section className="admin-panel"><div className="admin-panel__heading"><div><p className="admin-kicker">ADMINISTRATIVE HISTORY</p><h2>Activity history</h2><p>Recent content and media changes made by administrators.</p></div><span className="admin-count">{activities.length} events</span></div><ActivityList items={activities} /></section>;
}

function SettingsWorkspace({ user, onLogout }) {
  return <section className="admin-panel admin-settings"><div className="admin-panel__heading"><div><p className="admin-kicker">ACCOUNT & SECURITY</p><h2>Administrator settings</h2><p>Review your current session and account details.</p></div></div><div className="admin-profile-card"><span>{(user?.name || 'A').slice(0, 1).toUpperCase()}</span><div><p>ADMINISTRATOR ACCOUNT</p><h3>{user?.name}</h3><small>{user?.email}</small></div><ShieldCheck /></div><div className="admin-security-note"><ShieldCheck /><div><strong>Protected administrator session</strong><p>Authentication is verified by the server on each protected request. Sessions expire automatically after eight hours.</p></div></div><button className="admin-button admin-button--danger" onClick={onLogout}><LogOut /> Sign out of this account</button></section>;
}

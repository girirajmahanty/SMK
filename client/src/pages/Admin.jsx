import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowDown, ArrowLeft, ArrowUp, Check, ChevronRight, CircleAlert, Clock3, Eye, FileText,
  BookOpen, CloudRain, Drum, Flame, ImagePlus, Images, Landmark, LayoutDashboard, LoaderCircle, LogOut, Menu, MoonStar, Plus, Search,
  ShoppingBasket, Soup, Sprout, Sun, Sunrise, Swords, UtensilsCrossed, Wheat,
  Settings2, ShieldCheck, Sparkles, Trash2, Upload, UserRound, X, Camera, Users, Eye as Visits, GalleryHorizontalEnd, MapPin,
} from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { useLang, publicTextDefaults } from '../i18n.jsx';
import { api } from '../api.js';
import { village } from '../village.js';
import { small } from '../responsive.js';
import { shrinkImage } from '../imageTools.js';
import { ContentWorkspace, GalleryWorkspace, ImageField, MediaWorkspace, MembersWorkspace, PasswordCard, VisitWorkspace } from './adminTools.jsx';
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
  { id: 'gallery', label: 'Gallery', icon: GalleryHorizontalEnd },
  { id: 'content', label: 'Website content', icon: FileText },
  { id: 'visit', label: 'Visit & map', icon: MapPin },
  { id: 'media', label: 'Media library', icon: Images },
  { id: 'photos', label: 'Photo requests', icon: Camera },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'activity', label: 'Activity', icon: Clock3 },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];
const EMPTY_FESTIVAL = {
  name: { en: '', bn: '' }, date: { en: '', bn: '' }, text: { en: '', bn: '' },
  details: [], tone: 'kali', icon: 'Flame', img: '', position: '', featured: true, published: true,
  startDate: '', endDate: '', order: 0,
};
// Photos that ship with the website (client/public), offered next to uploaded images when choosing a festival photo.
const SITE_PHOTOS = [
  ...village.festivals.filter((item) => item.img).map((item) => ({ url: item.img, label: `Festival photo · ${item.name.en}` })),
  ...[village.storyImages.main, village.storyImages.side, ...village.gallery].filter((item) => item?.src)
    .map((item) => ({ url: item.src, label: `Website photo · ${item.caption?.en?.split(' — ')[0] || item.src.split('/').pop()}` })),
].filter((item, index, all) => all.findIndex((other) => other.url === item.url) === index);
// The photo a festival shows when none is chosen in the admin panel (matched by English name, as the website does).
const defaultFestivalPhoto = (festival) => village.festivals.find((item) => item.img && item.name.en === festival?.name?.en) || null;
const parseFocus = (value) => {
  const match = /^(\d{1,3}(?:\.\d+)?)% (\d{1,3}(?:\.\d+)?)%$/.exec(value || '');
  return match ? { x: Math.min(100, Number(match[1])), y: Math.min(100, Number(match[2])) } : { x: 50, y: 50 };
};
// One festival import per page load: React's development double render and quick reloads used to send two at once.
let festivalImport = null;
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

function FestivalEditor({ festival, media, onClose, onSave, onMediaChange }) {
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
          </div>
          <div className="admin-field"><span>Festival photo</span>
            <ImageField value={form.img || ''} onChange={(url) => change('img', url)} media={media} sitePhotos={SITE_PHOTOS} onMediaChange={onMediaChange}
              fallback={defaultFestivalPhoto(form)?.img || ''} emptyLabel={defaultFestivalPhoto(form) ? 'This festival’s website photo' : 'Card artwork'} />
          </div>
          <FocusPicker src={form.img || defaultFestivalPhoto(form)?.img || ''} value={form.position || (form.img ? '' : defaultFestivalPhoto(form)?.position) || ''} onChange={(value) => change('position', value)} />
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

// Choose which part of a festival photo stays in view when the website crops it (tall phone screens show a narrow
// strip, wide desktop screens a short band). Click the photo or use the sliders; the two previews show both crops.
function FocusPicker({ src, value, onChange }) {
  if (!src) return null;
  const focus = parseFocus(value);
  const set = (x, y) => onChange(`${Math.round(x)}% ${Math.round(y)}%`);
  const pick = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    set(((event.clientX - box.left) / box.width) * 100, ((event.clientY - box.top) / box.height) * 100);
  };
  const objectPosition = `${focus.x}% ${focus.y}%`;
  return (
    <fieldset className="admin-focus">
      <legend>Photo focus <small>the part kept in view when the photo is cropped</small></legend>
      <div className="admin-focus__body">
        <button type="button" className="admin-focus__photo" onClick={pick} aria-label="Click the part of the photo to keep in view">
          <img src={src} alt="" />
          <span className="admin-focus__dot" style={{ left: `${focus.x}%`, top: `${focus.y}%` }} aria-hidden="true" />
        </button>
        <div className="admin-focus__previews">
          <figure><div className="admin-focus__crop admin-focus__crop--phone"><img src={src} alt="" style={{ objectPosition }} /></div><figcaption>Phone</figcaption></figure>
          <figure><div className="admin-focus__crop admin-focus__crop--desktop"><img src={src} alt="" style={{ objectPosition }} /></div><figcaption>Desktop</figcaption></figure>
        </div>
      </div>
      <div className="admin-focus__sliders">
        <label>Left ↔ right<input type="range" min="0" max="100" value={focus.x} onChange={(event) => set(Number(event.target.value), focus.y)} /></label>
        <label>Top ↕ bottom<input type="range" min="0" max="100" value={focus.y} onChange={(event) => set(focus.x, Number(event.target.value))} /></label>
        <button type="button" className="admin-button admin-button--small" onClick={() => onChange('')}>Reset</button>
      </div>
    </fieldset>
  );
}

function FestivalWorkspace({ festivals, media, onCreate, onUpdate, onDelete, onReorder, onMediaChange }) {
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
          const photo = festival.img || defaultFestivalPhoto(festival)?.img;
          return <tr key={festival.id}><td><div className="admin-festival-cell">{photo ? <img src={small(photo)} alt="" /> : <span className="admin-festival-cell__icon"><Flame /></span>}<div><strong>{festival.name.en}</strong><small lang="bn">{festival.name.bn}{!festival.img && photo && <em className="admin-festival-cell__note"> · website photo</em>}</small></div></div></td><td><span className={`admin-status ${festival.published === false ? 'is-draft' : ''}`}><i />{festival.published === false ? 'Draft' : 'Live'}</span></td><td>{festival.startDate || festival.date?.en || 'Date not set'}</td><td>{formatDate(festival.updatedAt || festival.createdAt)}</td><td className="admin-order-cell"><button disabled={actualIndex === 0} onClick={() => onReorder(actualIndex, -1)} aria-label={`Move ${festival.name.en} up`}><ArrowUp /></button><button disabled={actualIndex === festivals.length - 1} onClick={() => onReorder(actualIndex, 1)} aria-label={`Move ${festival.name.en} down`}><ArrowDown /></button></td><td><div className="admin-row-actions"><button className="admin-button admin-button--small" onClick={() => setEditing(festival)}>Edit</button><button className="admin-icon-button admin-danger" onClick={() => { if (window.confirm(`Permanently delete ${festival.name.en}? This cannot be undone.`)) onDelete(festival); }} aria-label={`Delete ${festival.name.en}`}><Trash2 /></button></div></td></tr>;
        })}
      </tbody></table>
      {!shown.length && <div className="admin-empty"><Flame /><h3>No festivals found</h3><p>Add a festival or adjust your filters.</p></div>}</div>
      {editing !== undefined && <FestivalEditor festival={editing || undefined} media={media} onMediaChange={onMediaChange} onClose={() => setEditing(undefined)} onSave={(form) => editing ? onUpdate(editing.id, form) : onCreate(form)} />}
    </section>
  );
}

// Photos visitors sent from the website's gallery. Pending ones wait here until approved (shown on the site) or
// rejected (deleted). The "In the gallery" tab lists approved ones so they can be taken down later.
function PhotoRequestsWorkspace({ onChange, onToast, onError }) {
  const [tab, setTab] = useState('pending');
  const [items, setItems] = useState(null);
  const [busyId, setBusyId] = useState('');
  const [viewing, setViewing] = useState(null);
  const [draft, setDraft] = useState({ caption: '', cat: 'village' });
  const [saving, setSaving] = useState(false);
  const view = (item) => { setViewing(item); setDraft({ caption: item.caption, cat: item.cat }); };
  const edited = viewing && (draft.caption.trim() !== viewing.caption || draft.cat !== viewing.cat);

  const load = async (status) => {
    try {
      const list = await api.adminGalleryPhotos(status);
      setItems(list);
      if (status === 'pending') onChange(list.length);
    } catch (reason) {
      setItems([]);
      onError(reason.message || 'Photo requests could not be loaded.');
    }
  };
  useEffect(() => { setItems(null); load(tab); }, [tab]);
  useEffect(() => {
    if (!viewing) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') setViewing(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewing]);

  const saveDraft = async () => {
    if (!draft.caption.trim()) return onError('Please add a short caption.');
    setSaving(true);
    try {
      const updated = await api.updateGalleryPhoto(viewing.id, { caption: draft.caption.trim(), cat: draft.cat });
      setViewing(updated);
      setItems((current) => current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      onToast('Photo details saved');
      return true;
    } catch (reason) {
      onError(reason.message || 'That change could not be saved.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const act = async (item, approve) => {
    // approving from the viewer keeps an unsaved caption fix
    if (approve && viewing?.id === item.id && edited && !(await saveDraft())) return;
    if (!approve && !window.confirm(item.status === 'approved' ? 'Remove this photo from the website gallery? It will be deleted.' : 'Reject this photo? It will be deleted.')) return;
    setBusyId(item.id);
    try {
      if (approve) await api.approveGalleryPhoto(item.id);
      else await api.deleteGalleryPhoto(item.id);
      setViewing(null);
      onToast(approve ? 'Photo approved and added to the gallery' : item.status === 'approved' ? 'Photo removed from the gallery' : 'Photo rejected');
      await load(tab);
    } catch (reason) {
      onError(reason.message || 'That change could not be saved.');
    } finally {
      setBusyId('');
    }
  };

  const catLabel = { village: 'Village', temple: 'Temple', procession: 'Kali Puja' };
  const actions = (item, small) => (
    <div className="admin-media-card__actions">
      {item.status === 'pending' && <button className={`admin-button admin-button--primary ${small ? 'admin-button--small' : ''}`} disabled={busyId === item.id} onClick={() => act(item, true)}>{busyId === item.id ? <LoaderCircle className="admin-spin" /> : <Check />} Approve</button>}
      <button className={`admin-button admin-photo-reject ${small ? 'admin-button--small' : ''}`} disabled={busyId === item.id} onClick={() => act(item, false)}><Trash2 /> {item.status === 'pending' ? 'Reject' : 'Remove'}</button>
    </div>
  );
  return (
    <section className="admin-panel">
      <div className="admin-panel__heading"><div><p className="admin-kicker">FROM VISITORS</p><h2>Photo requests</h2><p>Signed-in visitors can send photos from the website's gallery. They appear on the site only after you approve them.</p></div><span className="admin-count">{items ? items.length : '…'} {tab === 'pending' ? 'waiting' : 'in gallery'}</span></div>
      <div className="admin-photo-tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'pending'} className={tab === 'pending' ? 'is-active' : ''} onClick={() => setTab('pending')}><Clock3 /> Waiting for approval</button>
        <button role="tab" aria-selected={tab === 'approved'} className={tab === 'approved' ? 'is-active' : ''} onClick={() => setTab('approved')}><Check /> In the gallery</button>
      </div>
      {!items ? <div className="admin-loading"><LoaderCircle className="admin-spin" /><span>Loading photos…</span></div>
        : !items.length ? <div className="admin-empty"><Camera /><h3>{tab === 'pending' ? 'No photos waiting' : 'No visitor photos in the gallery yet'}</h3><p>{tab === 'pending' ? 'New photos from visitors will show up here.' : 'Photos you approve are listed here.'}</p></div>
        : <div className="admin-media-grid">{items.map((item) => (
          <article key={item.id} className="admin-media-card admin-photo-card">
            <button className="admin-media-card__image admin-photo-card__image" onClick={() => view(item)} aria-label={`View photo: ${item.caption}`}><img src={item.url} alt={item.caption} loading="lazy" /><span>{catLabel[item.cat] || item.cat}</span></button>
            <p className="admin-photo-card__caption">{item.caption}</p>
            <p className="admin-photo-card__meta"><UserRound /> {item.by || 'Visitor'} · {formatDate(item.createdAt)}</p>
            <button className="admin-text-button admin-photo-card__edit" onClick={() => view(item)}>Edit caption or category <ChevronRight /></button>
            {actions(item, true)}
          </article>
        ))}</div>}
      {viewing && <div className="admin-photo-view" role="dialog" aria-modal="true" aria-label={viewing.caption} onClick={() => setViewing(null)}>
        <figure onClick={(event) => event.stopPropagation()}>
          <button className="admin-icon-button admin-photo-view__close" onClick={() => setViewing(null)} aria-label="Close" autoFocus><X /></button>
          <img src={viewing.url} alt={viewing.caption} />
          <figcaption><span>{viewing.by || 'Visitor'} · {formatDate(viewing.createdAt)} · {viewing.w}×{viewing.h}</span></figcaption>
          <div className="admin-photo-edit">
            <label>Caption<textarea value={draft.caption} maxLength={200} rows={2} onChange={(event) => setDraft({ ...draft, caption: event.target.value })} /></label>
            <label>Category<select value={draft.cat} onChange={(event) => setDraft({ ...draft, cat: event.target.value })}>{Object.entries(catLabel).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            {edited && <button className="admin-button admin-button--small" disabled={saving} onClick={saveDraft}>{saving ? <LoaderCircle className="admin-spin" /> : <Check />} Save changes</button>}
          </div>
          {actions(viewing, false)}
        </figure>
      </div>}
    </section>
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
  const [pendingPhotos, setPendingPhotos] = useState(0);

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
        festivalImport ??= api.initializeFestivals(initial).finally(() => { festivalImport = null; });
        await festivalImport;
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
  // the overview carries how many visitor photos wait for approval
  useEffect(() => { setPendingPhotos(overview.stats?.photoRequests ?? 0); }, [overview]);
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
  // Several content keys in one go (a gallery photo's caption, category and photo), then one reload.
  const saveMany = (entries, message) => perform(async () => {
    for (const [key, value] of entries) await api.saveContent(key, value);
    await refreshCmsContent();
  }, message);
  const resetMany = (keys, message) => perform(async () => {
    for (const key of keys) await api.resetContent(key);
    await refreshCmsContent();
  }, message);
  const refreshMedia = async () => {
    const next = await api.adminMedia();
    setMedia(next);
    return next;
  };
  const captionMedia = (item, caption) => perform(async () => { await api.updateMedia(item.id, caption); }, 'Image caption updated');
  const removeMedia = (item) => perform(async () => { await api.deleteMedia(item.id); }, 'Image deleted');
  const replaceMedia = async (item, file) => {
    let data;
    try {
      data = await shrinkImage(file);
    } catch (reason) {
      setError(reason.message || 'The image could not be read.');
      return;
    }
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
        <nav aria-label="Admin navigation">{NAV_ITEMS.map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? 'is-active' : ''} onClick={() => { setSection(id); setMobileNav(false); }}><Icon /><span>{label}</span>{id === 'festivals' && <small>{overview.stats?.festivals || ''}</small>}{id === 'photos' && pendingPhotos > 0 && <small className="admin-nav-badge">{pendingPhotos}</small>}</button>)}</nav>
        <div className="admin-sidebar__bottom"><div className="admin-account"><span>{(user?.name || 'A').slice(0, 1).toUpperCase()}</span><div><strong>{user?.name}</strong><small>Administrator</small></div></div><button className="admin-side-logout" onClick={signOut}><LogOut /> Sign out</button></div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar"><button className="admin-mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation">{mobileNav ? <X /> : <Menu />}</button><div className="admin-breadcrumb"><span>Admin</span><ChevronRight /><strong>{pageTitle}</strong></div><div className="admin-topbar__right"><span className="admin-live"><i /> Live site</span><a href="/" target="_blank" rel="noreferrer"><Eye /> Preview</a><span className="admin-avatar">{(user?.name || 'A').slice(0, 1).toUpperCase()}</span></div></header>
        <main className="admin-workspace">
          <div className="admin-welcome"><div><p className="admin-kicker">{new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(new Date()).toUpperCase()} · SIDHAGORA, PURULIA</p><h1>{section === 'overview' ? `Good to see you, ${(user?.name || 'Admin').split(' ')[0]}.` : pageTitle}</h1><p>Manage your village website with care and confidence.</p></div><span><Sparkles /> A village of heritage, culture & festivals</span></div>
          {error && <div className="admin-alert admin-alert--banner" role="alert"><CircleAlert />{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X /></button></div>}
          {loading ? <div className="admin-loading"><LoaderCircle className="admin-spin" /><span>Loading your workspace…</span></div> : (
            <>
              {section === 'overview' && <Overview stats={overview.stats || {}} activities={activities} navigate={setSection} pendingPhotos={pendingPhotos} />}
              {section === 'festivals' && <FestivalWorkspace festivals={festivals} media={media} onMediaChange={refreshMedia} onCreate={createFestival} onUpdate={updateFestival} onDelete={deleteFestival} onReorder={reorderFestival} />}
              {section === 'gallery' && <GalleryWorkspace records={content} media={media} sitePhotos={SITE_PHOTOS} onSaveMany={saveMany} onReset={resetContent} onMediaChange={refreshMedia} />}
              {section === 'content' && <ContentWorkspace fields={CONTENT_FIELDS} records={content} media={media} sitePhotos={SITE_PHOTOS} onSave={saveContent} onReset={resetContent} onMediaChange={refreshMedia} />}
              {section === 'visit' && <VisitWorkspace records={content} onSaveMany={saveMany} onResetMany={resetMany} />}
              {section === 'media' && <MediaWorkspace media={media} onMediaChange={refreshMedia} onCaption={captionMedia} onDelete={removeMedia} onReplace={replaceMedia} onToast={setToast} />}
              {section === 'members' && <MembersWorkspace currentUser={user} onToast={setToast} onError={setError} />}
              {section === 'photos' && <PhotoRequestsWorkspace onChange={setPendingPhotos} onToast={setToast} onError={setError} />}
              {section === 'activity' && <ActivityWorkspace activities={activities} />}
              {section === 'settings' && <SettingsWorkspace user={user} onLogout={signOut} onToast={setToast} />}
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

function Overview({ stats, activities, navigate, pendingPhotos }) {
  const quickActions = [
    { title: 'Add a festival', text: 'Create a new festival card', section: 'festivals', icon: Flame },
    { title: 'Edit website copy', text: 'Update Bengali or English text', section: 'content', icon: FileText },
    { title: 'Upload photos', text: 'Add photos to your media library', section: 'media', icon: ImagePlus },
    { title: 'Manage the gallery', text: 'Add, hide or reorder gallery photos', section: 'gallery', icon: GalleryHorizontalEnd },
    { title: 'Members', text: 'See accounts and choose admins', section: 'members', icon: Users },
  ];
  return <>
    {pendingPhotos > 0 && <button className="admin-photo-alert" onClick={() => navigate('photos')}>
      <span><Camera /></span>
      <div><strong>{pendingPhotos === 1 ? '1 photo from a visitor is waiting for approval' : `${pendingPhotos} photos from visitors are waiting for approval`}</strong><small>Approve them to show them in the website gallery, or reject them.</small></div>
      <em>Review <ChevronRight /></em>
    </button>}
    <div className="admin-stat-grid">
      <StatCard icon={Flame} label="Festival cards" value={stats.festivals ?? 0} detail="Published and draft cards" accent="gold" />
      <StatCard icon={FileText} label="Content overrides" value={stats.content ?? 0} detail="Bilingual website fields saved" accent="blue" />
      <StatCard icon={Images} label="Library images" value={stats.media ?? 0} detail="Validated server uploads" accent="green" />
      <StatCard icon={Users} label="Members" value={stats.members ?? '—'} detail="Accounts on the website" accent="plum" />
      <StatCard icon={Visits} label="Visits" value={stats.visits ?? '—'} detail="Times the website was opened" accent="gold" />
      <StatCard icon={Camera} label="Photo requests" value={stats.photoRequests ?? 0} detail="Visitor photos waiting" accent="blue" />
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

function SettingsWorkspace({ user, onLogout, onToast }) {
  return <section className="admin-panel admin-settings"><div className="admin-panel__heading"><div><p className="admin-kicker">ACCOUNT & SECURITY</p><h2>Administrator settings</h2><p>Review your current session and account details.</p></div></div><div className="admin-profile-card"><span>{(user?.name || 'A').slice(0, 1).toUpperCase()}</span><div><p>ADMINISTRATOR ACCOUNT</p><h3>{user?.name}</h3><small>{user?.email}</small></div><ShieldCheck /></div><div className="admin-security-note"><ShieldCheck /><div><strong>Protected administrator session</strong><p>Authentication is verified by the server on each protected request. Sessions expire automatically after eight hours.</p></div></div><PasswordCard onToast={onToast} /><button className="admin-button admin-button--danger" onClick={onLogout}><LogOut /> Sign out of this account</button></section>;
}

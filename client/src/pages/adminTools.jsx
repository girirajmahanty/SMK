// Admin panel parts: photo picker (with upload), gallery manager, grouped website content, media library,
// visit & map, members, and password change. Admin.jsx wires them into the dashboard.
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDown, ArrowUp, Check, ChevronDown, CircleAlert, ExternalLink, Eye, EyeOff, FileText, ImagePlus, Images, KeyRound,
  LoaderCircle, MapPin, Pencil, Play, Plus, RotateCcw, Route, Search, ShieldCheck, ShieldOff, Trash2, Upload, UserRound, Users, X,
} from 'lucide-react';
import { api } from '../api.js';
import { shrinkImage, isImageFile } from '../imageTools.js';
import { originalGallery, originalVisit, readGalleryLayout, readRoutes } from '../villageCms.js';

const CAT_LABELS = { village: 'Village', temple: 'Temple', procession: 'Kali Puja' };
const formatDate = (value) => (value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : '—');
const nameOf = (file) => file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 120);

// Shrinks and uploads photos one after another. Returns the uploaded media records.
export async function uploadPhotos(files, onProgress) {
  const uploaded = [];
  for (const [index, file] of files.entries()) {
    onProgress?.(index + 1, files.length);
    if (!isImageFile(file)) throw new Error(`"${file.name}" is not a photo (JPG, PNG, WebP or GIF).`);
    const data = await shrinkImage(file);
    uploaded.push(await api.uploadMedia({ data, caption: nameOf(file) }));
  }
  return uploaded;
}

// Keeps Tab inside a dialog, closes it on Escape, and gives focus back when it closes.
// Dialogs can open on top of each other (the photo picker inside the photo editor): only the top one reacts.
const openDialogs = [];
function useDialog(ref, onClose) {
  useEffect(() => {
    const id = Symbol('dialog');
    openDialogs.push(id);
    const opener = document.activeElement;
    requestAnimationFrame(() => ref.current?.querySelector('input, button, textarea, select')?.focus());
    const onKey = (event) => {
      if (openDialogs[openDialogs.length - 1] !== id) return;
      if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
      if (event.key === 'Tab' && ref.current) {
        const items = [...ref.current.querySelectorAll('button:not([disabled]), input, textarea, select, [tabindex="0"]')];
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      openDialogs.splice(openDialogs.indexOf(id), 1);
      window.removeEventListener('keydown', onKey, true);
      opener?.focus?.({ preventScroll: true });
    };
  }, []);
}

// ---------------------------------------------------------------------------------------------------------------
// Photo picker: every uploaded photo and every photo that ships with the website, as thumbnails, with search and an
// "Upload new photos" button (phone photos are shrunk first). Picking one returns its URL.
export function ImagePicker({ media, sitePhotos, value, onPick, onClose, onMediaChange, title = 'Choose a photo' }) {
  const [tab, setTab] = useState(media.length ? 'uploaded' : 'site');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const box = useRef(null);
  const fileRef = useRef(null);
  useDialog(box, onClose);

  const list = (tab === 'uploaded'
    ? media.map((item) => ({ url: item.url, label: item.caption || item.filename, item }))
    : sitePhotos.map((item) => ({ url: item.url, label: item.label })))
    .filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  const upload = async (event) => {
    const files = [...(event.target.files || [])];
    event.target.value = '';
    if (!files.length) return;
    setError('');
    try {
      const uploaded = await uploadPhotos(files, (n, total) => setBusy(total > 1 ? `Uploading ${n} of ${total}…` : 'Uploading…'));
      await onMediaChange();
      setTab('uploaded');
      // one photo: use it straight away
      if (uploaded.length === 1) onPick(uploaded[0].url, uploaded[0]);
    } catch (reason) {
      setError(reason.message || 'The upload failed.');
    } finally {
      setBusy('');
    }
  };

  // Rendered at the end of <body>: the picker is often opened from inside another form (festival, gallery photo),
  // and its buttons and search box must not submit that form.
  return createPortal(
    <div className="admin-modal-backdrop admin-picker-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="admin-modal admin-picker" role="dialog" aria-modal="true" aria-label={title} ref={box}>
        <header><div><p className="admin-kicker">PHOTOS</p><h2>{title}</h2></div><button type="button" className="admin-icon-button" onClick={onClose} aria-label="Close"><X /></button></header>
        <div className="admin-picker__bar">
          <div className="admin-photo-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'uploaded'} className={tab === 'uploaded' ? 'is-active' : ''} onClick={() => setTab('uploaded')}><Images /> Uploaded ({media.length})</button>
            <button type="button" role="tab" aria-selected={tab === 'site'} className={tab === 'site' ? 'is-active' : ''} onClick={() => setTab('site')}><ImagePlus /> Website photos ({sitePhotos.length})</button>
          </div>
          <label className="admin-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search photos…" /></label>
          <button type="button" className="admin-button admin-button--primary" onClick={() => fileRef.current.click()} disabled={!!busy}>{busy ? <LoaderCircle className="admin-spin" /> : <Upload />} {busy || 'Upload new photos'}</button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={upload} />
        </div>
        {error && <p className="admin-alert" role="alert"><CircleAlert /> {error}</p>}
        <div className="admin-picker__grid">
          {list.map((item) => (
            <button type="button" key={item.url} className={`admin-picker__item ${item.url === value ? 'is-selected' : ''}`} onClick={() => onPick(item.url, item.item)} title={item.label}>
              <img src={item.url} alt="" loading="lazy" />
              <span>{item.label}</span>
              {item.url === value && <i><Check /></i>}
            </button>
          ))}
          {!list.length && <div className="admin-empty admin-empty--compact"><Images /><h3>{query ? 'No matching photos' : 'No photos here yet'}</h3><p>{tab === 'uploaded' ? 'Use “Upload new photos” to add some.' : 'Try the uploaded photos.'}</p></div>}
        </div>
      </section>
    </div>,
    document.body,
  );
}

// A photo setting: the current photo as a thumbnail, "Change photo" (opens the picker) and, optionally, "Use original".
export function ImageField({ value, onChange, media, sitePhotos, onMediaChange, fallback = '', emptyLabel = 'Original website photo', allowReset = true }) {
  const [open, setOpen] = useState(false);
  const shown = value || fallback;
  return (
    <div className="admin-image-pick">
      <div className="admin-image-pick__preview">{shown ? <img src={shown} alt="" /> : <Images />}{!value && <span>{emptyLabel}</span>}</div>
      <div className="admin-image-pick__actions">
        <button type="button" className="admin-button admin-button--small" onClick={() => setOpen(true)}><ImagePlus /> Change photo</button>
        {allowReset && value && <button type="button" className="admin-button admin-button--small" onClick={() => onChange('')}>Use original</button>}
      </div>
      {open && <ImagePicker media={media} sitePhotos={sitePhotos} value={value} onMediaChange={onMediaChange}
        onClose={() => setOpen(false)} onPick={(url, item) => { onChange(url, item); setOpen(false); }} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Gallery: every photo on the website's gallery (the village's own and added ones) in their order on the site.
// Move up/down, hide/show, edit caption, category and photo, add new photos, delete added ones.
function galleryItems(records) {
  const own = originalGallery.map((item, index) => ({
    id: `o:${index}`, index, own: true, video: item.video,
    src: records[`village.gallery.${index}.src`]?.en || item.src,
    caption: records[`village.gallery.${index}.caption`] || item.caption,
    cat: records[`village.gallery.${index}.cat`]?.en || item.cat,
    w: item.w, h: item.h, originalSrc: item.src,
  }));
  const added = Object.entries(records).filter(([key]) => key.startsWith('village.gallery.custom.')).flatMap(([key, value]) => {
    try {
      const item = JSON.parse(value.en);
      return [{ id: `c:${key.slice('village.gallery.custom.'.length)}`, key, own: false, ...item }];
    } catch { return []; }
  });
  const layout = readGalleryLayout(records);
  const rank = new Map(layout.order.map((id, position) => [id, position]));
  const all = [...own, ...added].map((item, position) => ({ ...item, hidden: layout.hidden.includes(item.id), rank: rank.has(item.id) ? rank.get(item.id) : layout.order.length + position }));
  return { items: all.sort((a, b) => a.rank - b.rank), layout };
}

export function GalleryWorkspace({ records, media, sitePhotos, onSaveMany, onReset, onMediaChange }) {
  const { items, layout } = useMemo(() => galleryItems(records), [records]);
  const [editing, setEditing] = useState(null); // item, or {} for a new photo
  const [filter, setFilter] = useState('all');
  const shown = items.filter((item) => filter === 'all' || (filter === 'hidden' ? item.hidden : item.cat === filter && !item.hidden));

  const saveLayout = (order, hidden) => onSaveMany([['village.gallery.layout', { en: JSON.stringify({ order, hidden }), bn: '' }]], 'Gallery updated');
  const move = (item, step) => {
    const order = items.map((entry) => entry.id);
    const from = order.indexOf(item.id), to = from + step;
    if (to < 0 || to >= order.length) return;
    [order[from], order[to]] = [order[to], order[from]];
    saveLayout(order, layout.hidden);
  };
  const toggle = (item) => saveLayout(items.map((entry) => entry.id), item.hidden ? layout.hidden.filter((id) => id !== item.id) : [...layout.hidden, item.id]);
  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.caption?.en || 'this photo'}" from the gallery? The photo stays in the media library.`)) return;
    await onReset(item.key);
  };

  const visible = items.filter((item) => !item.hidden).length;
  return (
    <section className="admin-panel">
      <div className="admin-panel__heading"><div><p className="admin-kicker">WEBSITE GALLERY</p><h2>Gallery photos</h2><p>Everything in the website’s gallery, in the order it is shown. Hide a photo to take it off the site without deleting it.</p></div><button className="admin-button admin-button--primary" onClick={() => setEditing({})}><Plus /> Add photo</button></div>
      <div className="admin-photo-tabs">
        {[['all', `All (${items.length})`], ['procession', 'Kali Puja'], ['temple', 'Temple'], ['village', 'Village'], ['hidden', `Hidden (${items.length - visible})`]].map(([id, label]) => (
          <button key={id} className={filter === id ? 'is-active' : ''} onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>
      <div className="admin-gallery-list">
        {shown.map((item) => {
          const position = items.indexOf(item);
          return (
            <article key={item.id} className={`admin-gallery-item ${item.hidden ? 'is-hidden' : ''}`}>
              <div className="admin-gallery-item__thumb">
                {item.video && !item.src ? <span className="admin-gallery-item__video"><Play /> Video</span> : <img src={item.src} alt="" loading="lazy" />}
                <b>{position + 1}</b>
                {item.hidden && <em><EyeOff /> Hidden</em>}
              </div>
              <div className="admin-gallery-item__text">
                <strong>{item.caption?.en || 'No caption'}</strong>
                <small lang="bn">{item.caption?.bn}</small>
                <span>{CAT_LABELS[item.cat] || item.cat} · {item.own ? 'Village photo' : 'Added photo'}</span>
              </div>
              <div className="admin-gallery-item__actions">
                <button className="admin-icon-button" disabled={position === 0} onClick={() => move(item, -1)} aria-label="Move earlier" title="Move earlier"><ArrowUp /></button>
                <button className="admin-icon-button" disabled={position === items.length - 1} onClick={() => move(item, 1)} aria-label="Move later" title="Move later"><ArrowDown /></button>
                <button className="admin-icon-button" onClick={() => toggle(item)} aria-label={item.hidden ? 'Show on the website' : 'Hide from the website'} title={item.hidden ? 'Show on the website' : 'Hide from the website'}>{item.hidden ? <Eye /> : <EyeOff />}</button>
                <button className="admin-icon-button" onClick={() => setEditing(item)} aria-label="Edit" title="Edit"><Pencil /></button>
                {!item.own && <button className="admin-icon-button admin-danger" onClick={() => remove(item)} aria-label="Delete" title="Delete"><Trash2 /></button>}
              </div>
            </article>
          );
        })}
        {!shown.length && <div className="admin-empty admin-empty--compact"><Images /><h3>No photos here</h3></div>}
      </div>
      {editing && <GalleryPhotoEditor item={editing} media={media} sitePhotos={sitePhotos} onMediaChange={onMediaChange} onClose={() => setEditing(null)}
        onSave={async (entries, message) => { const ok = await onSaveMany(entries, message); if (ok) setEditing(null); return ok; }} />}
    </section>
  );
}

function GalleryPhotoEditor({ item, media, sitePhotos, onMediaChange, onClose, onSave }) {
  const isNew = !item.id;
  const [form, setForm] = useState(() => ({ src: isNew ? '' : item.src || '', caption: { en: item.caption?.en || '', bn: item.caption?.bn || '' }, cat: item.cat || 'village', w: item.w, h: item.h }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const box = useRef(null);
  useDialog(box, onClose);

  const save = async (event) => {
    event.preventDefault();
    const caption = { en: form.caption.en.trim(), bn: form.caption.bn.trim() };
    if (!item.video && !form.src) return setError('Choose a photo.');
    if (!caption.en && !caption.bn) return setError('Add a caption (English, Bangla or both).');
    caption.en ||= caption.bn;
    caption.bn ||= caption.en;
    setSaving(true);
    setError('');
    let entries;
    if (item.own) {
      entries = [
        [`village.gallery.${item.index}.caption`, caption],
        [`village.gallery.${item.index}.cat`, { en: form.cat, bn: form.cat }],
        ...(!item.video && form.src !== item.src ? [[`village.gallery.${item.index}.src`, { en: form.src, bn: form.src }]] : []),
      ];
    } else {
      const key = item.key || `village.gallery.custom.${crypto.randomUUID()}`;
      entries = [[key, { en: JSON.stringify({ src: form.src, cat: form.cat, caption, w: form.w || 1200, h: form.h || 900 }), bn: '' }]];
    }
    await onSave(entries, isNew ? 'Photo added to the gallery' : 'Gallery photo saved');
    setSaving(false);
  };

  return (
    <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="admin-modal" role="dialog" aria-modal="true" aria-label={isNew ? 'Add a gallery photo' : 'Edit gallery photo'} ref={box}>
        <header><div><p className="admin-kicker">WEBSITE GALLERY</p><h2>{isNew ? 'Add a photo' : 'Edit photo'}</h2></div><button className="admin-icon-button" onClick={onClose} aria-label="Close"><X /></button></header>
        <form className="admin-form" onSubmit={save}>
          {item.video ? <p className="admin-hint">This is a video; its caption and category can be changed.</p> : (
            <ImageField value={form.src} media={media} sitePhotos={sitePhotos} onMediaChange={onMediaChange} allowReset={false} emptyLabel="No photo chosen"
              onChange={(src, picked) => setForm((current) => ({ ...current, src, w: picked?.w || current.w, h: picked?.h || current.h }))} />
          )}
          <fieldset className="admin-localized">
            <legend>Caption</legend>
            <label><span>English</span><textarea value={form.caption.en} maxLength={300} onChange={(event) => setForm({ ...form, caption: { ...form.caption, en: event.target.value } })} /></label>
            <label><span>বাংলা</span><textarea lang="bn" value={form.caption.bn} maxLength={300} onChange={(event) => setForm({ ...form, caption: { ...form.caption, bn: event.target.value } })} /></label>
          </fieldset>
          <label>Category<select value={form.cat} onChange={(event) => setForm({ ...form, cat: event.target.value })}>{Object.entries(CAT_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          {error && <p className="admin-alert" role="alert"><CircleAlert /> {error}</p>}
          <footer><button type="button" className="admin-button" onClick={onClose}>Cancel</button><button className="admin-button admin-button--primary" disabled={saving}>{saving ? <LoaderCircle className="admin-spin" /> : <Check />} {isNew ? 'Add to gallery' : 'Save'}</button></footer>
        </form>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Website content, grouped by the part of the website it belongs to. Groups start closed; searching opens them all.
const SECTIONS = [
  ['announcement', 'Announcement bar', 'A short message across the top of every page (leave empty to hide it).'],
  ['hero', 'Home · top of the page', 'Title, introduction and buttons on the first screen.'],
  ['story', 'About the village', 'The story paragraphs, quote and photo captions.'],
  ['stat', 'Numbers', 'Labels for the village figures.'],
  ['life', 'Village life', 'The village life cards.'],
  ['gallery', 'Gallery text', 'Headings and labels of the gallery (photos are on the Gallery page).'],
  ['fest', 'Festivals text', 'Headings and labels of the festival section (festivals are on the Festivals page).'],
  ['visit', 'Visit', 'Address, how to reach and visitor information.'],
  ['footer', 'Footer', 'The bottom of every page.'],
  ['nav', 'Menu', 'Menu links.'],
  ['village', 'Village information', 'Established year, families and other facts.'],
  ['images', 'Website photos', 'The large photos on the home page.'],
  ['other', 'Other text', 'Everything else.'],
];
const sectionOf = (field) => {
  if (field.kind === 'image') return 'images';
  const key = field.key;
  if (/^village\.(story|storyImages|storyQuote)/.test(key)) return 'story';
  if (/^village\.life\./.test(key)) return 'life';
  if (/^village\.(heroLine|subtitle)$/.test(key)) return 'hero';
  if (key === 'village.address') return 'visit';
  const first = key.split('.')[0];
  return SECTIONS.some(([id]) => id === first) ? first : 'other';
};
const humanize = (key) => {
  const rest = key.split('.').slice(1).join(' ') || key;
  const words = rest.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[._-]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};
const titleOf = (field) => (field.label && field.label !== field.key ? field.label : humanize(field.key));

export function ContentWorkspace({ fields: allFields, records, media, sitePhotos, onSave, onReset, onMediaChange }) {
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState({});
  const [openGroups, setOpenGroups] = useState(() => new Set(['announcement']));
  // gallery photos and captions, and the address, have their own pages
  const fields = allFields.filter((field) => !field.key.startsWith('village.gallery.') && field.key !== 'village.address');
  const q = query.trim().toLowerCase();
  const matches = (field) => !q || `${field.key} ${titleOf(field)} ${(records[field.key] || field.value)?.en || ''} ${(records[field.key] || field.value)?.bn || ''}`.toLowerCase().includes(q);
  const groups = SECTIONS.map(([id, title, text]) => ({ id, title, text, fields: fields.filter((field) => sectionOf(field) === id && matches(field)) })).filter((group) => group.fields.length);
  const setEdit = (key, value) => setPending((state) => ({ ...state, [key]: value }));
  const toggle = (id) => setOpenGroups((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  return (
    <section className="admin-panel">
      <div className="admin-panel__heading"><div><p className="admin-kicker">PUBLISHED WEBSITE COPY</p><h2>Website content</h2><p>Every text and photo on the website, grouped by section. Changes go live when you save.</p></div><span className="admin-count">{fields.length} fields</span></div>
      <div className="admin-toolbar"><label className="admin-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search any text in English or বাংলা…" /></label></div>
      <div className="admin-groups">
        {groups.map((group) => {
          const open = !!q || openGroups.has(group.id);
          const changed = group.fields.filter((field) => records[field.key]).length;
          return (
            <div key={group.id} className={`admin-group ${open ? 'is-open' : ''}`}>
              <button className="admin-group__head" onClick={() => toggle(group.id)} aria-expanded={open}>
                <div><strong>{group.title}</strong><small>{group.text}</small></div>
                <span>{group.fields.length} {group.fields.length === 1 ? 'field' : 'fields'}{changed ? ` · ${changed} changed` : ''}</span>
                <ChevronDown />
              </button>
              {open && <div className="admin-content-list">{group.fields.map((field) => {
                const current = records[field.key] || field.value;
                const hasCustom = !!records[field.key];
                const editing = pending[field.key] || current;
                const dirty = !!pending[field.key];
                // a photo field holds only a changed photo; empty means the original
                const photo = pending[field.key] ? pending[field.key].en : records[field.key]?.en || '';
                return (
                  <article className="admin-content-row" key={field.key}>
                    <div className="admin-content-row__title"><span>{field.kind === 'image' ? <Images /> : <FileText />}</span><div><strong>{titleOf(field)}</strong><small>{field.key}{hasCustom && <em> · Changed</em>}</small></div></div>
                    {field.kind === 'image' ? (
                      <ImageField value={photo} fallback={field.value.en} media={media} sitePhotos={sitePhotos} onMediaChange={onMediaChange}
                        onChange={(url) => setEdit(field.key, { en: url, bn: url })} />
                    ) : field.kind === 'number' ? (
                      <div className="admin-content-row__inputs"><label><span>Year / count</span><input type="number" min="1" value={editing.en || ''} onChange={(event) => setEdit(field.key, { en: event.target.value, bn: event.target.value })} /></label></div>
                    ) : (
                      <div className="admin-content-row__inputs">
                        <label><span>English</span><textarea value={editing.en || ''} onChange={(event) => setEdit(field.key, { ...editing, en: event.target.value })} /></label>
                        <label><span>বাংলা</span><textarea lang="bn" value={editing.bn || ''} onChange={(event) => setEdit(field.key, { ...editing, bn: event.target.value })} /></label>
                      </div>
                    )}
                    <div className="admin-content-row__actions">
                      <button className="admin-button admin-button--small admin-button--primary" disabled={!dirty} onClick={async () => {
                        const toOriginal = field.kind === 'image' && !photo;
                        const ok = !toOriginal ? await onSave(field.key, editing) : hasCustom ? await onReset(field.key) : true;
                        if (ok !== false) setPending((state) => { const next = { ...state }; delete next[field.key]; return next; });
                      }}>Save changes</button>
                      {dirty && <button className="admin-button admin-button--small" onClick={() => setPending((state) => { const next = { ...state }; delete next[field.key]; return next; })}>Undo</button>}
                      {hasCustom && !dirty && <button className="admin-button admin-button--small" onClick={async () => { if (window.confirm(`Restore the original for "${titleOf(field)}"?`)) await onReset(field.key); }}>Restore original</button>}
                    </div>
                  </article>
                );
              })}</div>}
            </div>
          );
        })}
        {!groups.length && <div className="admin-empty"><Search /><h3>No matching content</h3><p>Try a different word.</p></div>}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Media library: upload several photos at once (shrunk first), search, edit captions, replace or delete.
export function MediaWorkspace({ media, onMediaChange, onCaption, onDelete, onReplace, onToast }) {
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const shown = media.filter((item) => `${item.caption} ${item.filename}`.toLowerCase().includes(query.toLowerCase()));

  const upload = async (files) => {
    if (!files.length) return;
    setError('');
    try {
      const uploaded = await uploadPhotos(files, (n, total) => setBusy(total > 1 ? `Uploading ${n} of ${total}…` : 'Uploading…'));
      await onMediaChange();
      onToast(uploaded.length === 1 ? 'Photo uploaded' : `${uploaded.length} photos uploaded`);
    } catch (reason) {
      setError(reason.message || 'The upload failed.');
      await onMediaChange();
    } finally {
      setBusy('');
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel__heading"><div><p className="admin-kicker">IMAGE COLLECTION</p><h2>Media library</h2><p>Photos you upload here can be used anywhere on the website: gallery, festivals and home page photos.</p></div><span className="admin-count">{media.length} photos</span></div>
      <div className={`admin-dropzone ${dragging ? 'is-dragging' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); upload([...event.dataTransfer.files]); }}>
        <span><Upload /></span>
        <div><strong>{busy || 'Drop photos here, or choose them'}</strong><small>JPG, PNG, WebP or GIF. Large phone photos are made smaller automatically. You can pick several at once.</small></div>
        <button className="admin-button admin-button--primary" onClick={() => fileRef.current.click()} disabled={!!busy}>{busy ? <LoaderCircle className="admin-spin" /> : <Plus />} Choose photos</button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(event) => { const files = [...event.target.files]; event.target.value = ''; upload(files); }} />
      </div>
      {error && <p className="admin-alert" role="alert"><CircleAlert /> {error}</p>}
      {media.length > 0 && <div className="admin-toolbar"><label className="admin-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by caption or file name…" /></label></div>}
      {!media.length ? <div className="admin-empty"><Images /><h3>No photos yet</h3><p>Upload photos to use them on the website.</p></div>
        : <div className="admin-media-grid">{shown.map((item) => <MediaCard key={item.id} item={item} onCaption={onCaption} onDelete={onDelete} onReplace={onReplace} />)}</div>}
    </section>
  );
}

function MediaCard({ item, onCaption, onDelete, onReplace }) {
  const [caption, setCaption] = useState(item.caption || '');
  const [replacing, setReplacing] = useState(false);
  useEffect(() => setCaption(item.caption || ''), [item.caption]);
  return (
    <article className="admin-media-card">
      <div className="admin-media-card__image"><img src={item.url} alt={item.caption || ''} loading="lazy" /><span>{item.w ? `${item.w}×${item.h} · ` : ''}{Math.max(1, Math.round(item.size / 1024))} KB</span></div>
      <label>Caption<input value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={300} /></label>
      <div className="admin-media-card__actions">
        <button className="admin-button admin-button--small" disabled={caption === (item.caption || '')} onClick={() => onCaption(item, caption)}>Save caption</button>
        <label className="admin-button admin-button--small admin-file--replace">{replacing ? <LoaderCircle className="admin-spin" /> : null}{replacing ? 'Replacing…' : 'Replace'}<input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; setReplacing(true); try { await onReplace(item, file); } finally { setReplacing(false); } }} /></label>
        <button className="admin-icon-button admin-danger" onClick={() => { if (window.confirm('Delete this photo permanently? Photos used on the website cannot be deleted.')) onDelete(item); }} aria-label={`Delete ${item.caption || item.filename}`}><Trash2 /></button>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Members: everyone with an account. Make someone an admin, remove admin rights, or delete an account.
export function MembersWorkspace({ currentUser, onToast, onError }) {
  const [members, setMembers] = useState(null);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState('');
  const load = () => api.adminMembers().then(setMembers).catch((reason) => { setMembers([]); onError(reason.message || 'Members could not be loaded.'); });
  useEffect(() => { load(); }, []);

  const act = async (member, action) => {
    const question = action === 'delete' ? `Delete ${member.name}'s account (${member.email})? Their photos stay on the site until you remove them.`
      : action === 'admin' ? `Make ${member.name} an admin? Admins can change everything on the website.` : `Remove admin rights from ${member.name}?`;
    if (!window.confirm(question)) return;
    setBusyId(member.id);
    try {
      if (action === 'delete') await api.deleteMember(member.id);
      else await api.setMemberRole(member.id, action === 'admin' ? 'admin' : 'member');
      onToast(action === 'delete' ? 'Account deleted' : action === 'admin' ? `${member.name} is now an admin` : `${member.name} is now a member`);
      await load();
    } catch (reason) {
      onError(reason.message || 'That change could not be saved.');
    } finally {
      setBusyId('');
    }
  };

  const list = (members || []).filter((member) => `${member.name} ${member.email}`.toLowerCase().includes(query.toLowerCase()));
  const admins = (members || []).filter((member) => member.role === 'admin').length;
  return (
    <section className="admin-panel">
      <div className="admin-panel__heading"><div><p className="admin-kicker">PEOPLE</p><h2>Members</h2><p>Everyone who has an account. Members can send photos and words; admins can manage the whole website.</p></div><span className="admin-count">{members ? `${members.length} accounts · ${admins} admin${admins === 1 ? '' : 's'}` : '…'}</span></div>
      <div className="admin-toolbar"><label className="admin-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email…" /></label></div>
      {!members ? <div className="admin-loading"><LoaderCircle className="admin-spin" /><span>Loading members…</span></div>
        : !list.length ? <div className="admin-empty"><Users /><h3>No members found</h3></div>
          : <div className="admin-members">{list.map((member) => {
            const self = member.id === currentUser?.id;
            return (
              <article key={member.id} className="admin-member">
                <span className="admin-member__avatar">{member.name.slice(0, 1).toUpperCase()}</span>
                <div className="admin-member__text"><strong>{member.name}{self && <em> (you)</em>}</strong><small>{member.email}</small><small>Joined {formatDate(member.createdAt)}</small></div>
                <span className={`admin-role admin-role--${member.role}`}>{member.role === 'admin' ? <ShieldCheck /> : <UserRound />}{member.role === 'admin' ? 'Admin' : 'Member'}</span>
                <div className="admin-member__actions">
                  {!self && (member.role === 'admin'
                    ? <button className="admin-button admin-button--small" disabled={busyId === member.id} onClick={() => act(member, 'member')}><ShieldOff /> Remove admin</button>
                    : <button className="admin-button admin-button--small" disabled={busyId === member.id} onClick={() => act(member, 'admin')}><ShieldCheck /> Make admin</button>)}
                  {!self && <button className="admin-icon-button admin-danger" disabled={busyId === member.id} onClick={() => act(member, 'delete')} aria-label={`Delete ${member.name}`} title="Delete account"><Trash2 /></button>}
                </div>
              </article>
            );
          })}</div>}
    </section>
  );
}

// Change your own password.
export function PasswordCard({ onToast }) {
  const [form, setForm] = useState({ current: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('The new passwords do not match.');
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) return setError('Use at least 8 characters, with letters and numbers.');
    setBusy(true);
    try {
      await api.changePassword({ current: form.current, password: form.password });
      setForm({ current: '', password: '', confirm: '' });
      onToast('Password changed');
    } catch (reason) {
      setError(reason.message || 'The password could not be changed.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="admin-password" onSubmit={submit}>
      <div className="admin-password__head"><KeyRound /><div><strong>Change password</strong><small>Use at least 8 characters, with letters and numbers.</small></div></div>
      <label>Current password<input type="password" autoComplete="current-password" value={form.current} onChange={(event) => setForm({ ...form, current: event.target.value })} required /></label>
      <label>New password<input type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
      <label>Repeat new password<input type="password" autoComplete="new-password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} required /></label>
      {error && <p className="admin-alert" role="alert"><CircleAlert /> {error}</p>}
      <button className="admin-button admin-button--primary" disabled={busy}>{busy ? <LoaderCircle className="admin-spin" /> : <Check />} Change password</button>
    </form>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Visit & map: the address, the map pin and link, and the "How to reach" routes with their steps.
const VISIT_KEYS = ['village.address', 'village.mapQuery', 'village.coords', 'village.mapLink', 'village.routes'];
const COORDS_RX = /^-?\d{1,2}(\.\d+)?,-?\d{1,3}(\.\d+)?$/;
const MAP_LINK_RX = /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i;
const STEP_LABELS = { bus: 'Bus', train: 'Train', toto: 'Toto', walk: 'Walk' };
const BY_LABELS = { bus: 'By bus', train: 'By train', both: 'Train or bus' };
const emptyRoute = () => ({ from: { en: '', bn: '' }, query: '', distance: { en: '', bn: '' }, time: { en: '', bn: '' }, by: 'bus', steps: [{ mode: 'bus', en: '', bn: '' }] });
const clone = (value) => JSON.parse(JSON.stringify(value));

function visitForm(records) {
  return {
    address: records['village.address'] ? { en: records['village.address'].en, bn: records['village.address'].bn } : { ...originalVisit.address },
    mapQuery: records['village.mapQuery']?.en || originalVisit.mapQuery,
    coords: records['village.coords']?.en || originalVisit.coords,
    mapLink: records['village.mapLink']?.en || originalVisit.mapLink,
    routes: readRoutes(records) || clone(originalVisit.routes),
  };
}

export function VisitWorkspace({ records, onSaveMany, onResetMany }) {
  const [form, setForm] = useState(() => visitForm(records));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const saved = useMemo(() => JSON.stringify(visitForm(records)), [records]);
  useEffect(() => setForm(visitForm(records)), [saved]);
  const dirty = JSON.stringify(form) !== saved;
  const changed = VISIT_KEYS.some((key) => records[key]);

  const setRoute = (index, value) => setForm((current) => ({ ...current, routes: current.routes.map((route, i) => (i === index ? { ...route, ...value } : route)) }));
  const moveRoute = (index, step) => setForm((current) => {
    const routes = [...current.routes];
    [routes[index], routes[index + step]] = [routes[index + step], routes[index]];
    return { ...current, routes };
  });
  const setStep = (routeIndex, stepIndex, value) => setRoute(routeIndex, { steps: form.routes[routeIndex].steps.map((step, i) => (i === stepIndex ? { ...step, ...value } : step)) });

  const save = async () => {
    setError('');
    const coords = form.coords.replace(/\s+/g, '');
    if (!COORDS_RX.test(coords)) return setError('The map pin must be "latitude,longitude", for example 23.0398938,86.2818169.');
    if (form.mapLink.trim() && !MAP_LINK_RX.test(form.mapLink.trim())) return setError('The map link must be a Google Maps link (https://www.google.com/maps/… or https://maps.app.goo.gl/…).');
    if (!form.mapQuery.trim()) return setError('Add the place name for the map.');
    if (!form.address.en.trim() && !form.address.bn.trim()) return setError('Add the address.');
    const both = (value) => ({ en: value.en.trim() || value.bn.trim(), bn: value.bn.trim() || value.en.trim() });
    const routes = form.routes.map((route) => ({
      ...route,
      from: both(route.from),
      distance: both(route.distance),
      time: both(route.time),
      query: route.query.trim() || route.from.en.trim() || route.from.bn.trim(),
      steps: route.steps.filter((step) => step.en.trim() || step.bn.trim()).map((step) => ({ mode: step.mode, ...both(step) })),
    }));
    if (routes.some((route) => !route.from.en)) return setError('Every route needs a starting place.');
    setSaving(true);
    await onSaveMany([
      ['village.address', both(form.address)],
      ['village.mapQuery', { en: form.mapQuery.trim(), bn: form.mapQuery.trim() }],
      ['village.coords', { en: coords, bn: coords }],
      ['village.mapLink', { en: form.mapLink.trim(), bn: form.mapLink.trim() }],
      ['village.routes', { en: JSON.stringify(routes), bn: '' }],
    ], 'Visit details saved');
    setSaving(false);
  };
  const restore = async () => {
    if (!window.confirm('Restore the original address, map and routes? Your changes here will be removed.')) return;
    await onResetMany(VISIT_KEYS.filter((key) => records[key]), 'Original visit details restored');
  };

  const testLink = form.mapLink.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.coords || form.mapQuery)}`;
  const saveButton = <button className="admin-button admin-button--primary" disabled={!dirty || saving} onClick={save}>{saving ? <LoaderCircle className="admin-spin" /> : <Check />} Save changes</button>;
  return (
    <section className="admin-panel admin-visit">
      <div className="admin-panel__heading"><div><p className="admin-kicker">PLAN YOUR VISIT</p><h2>Visit & map</h2><p>The address, the map and the “How to reach” routes in the website’s Visit section.</p></div>
        <div className="admin-visit__save">{changed && <button className="admin-button" onClick={restore}><RotateCcw /> Restore original</button>}{saveButton}</div>
      </div>
      {error && <p className="admin-alert" role="alert"><CircleAlert /> {error}</p>}

      <div className="admin-visit__block">
        <h3><MapPin /> Address and map</h3>
        <div className="admin-form">
          <fieldset className="admin-localized">
            <legend>Address</legend>
            <label><span>English</span><textarea value={form.address.en} onChange={(event) => setForm({ ...form, address: { ...form.address, en: event.target.value } })} /></label>
            <label><span>বাংলা</span><textarea lang="bn" value={form.address.bn} onChange={(event) => setForm({ ...form, address: { ...form.address, bn: event.target.value } })} /></label>
          </fieldset>
          <div className="admin-form-grid">
            <label>Place name on the map<input value={form.mapQuery} maxLength={120} onChange={(event) => setForm({ ...form, mapQuery: event.target.value })} placeholder="Sidhagora Kali Mandir" /></label>
            <label>Map pin (latitude,longitude)<input value={form.coords} maxLength={40} onChange={(event) => setForm({ ...form, coords: event.target.value })} placeholder="23.0398938,86.2818169" /></label>
          </div>
          <label>“Open in Google Maps” link<input value={form.mapLink} onChange={(event) => setForm({ ...form, mapLink: event.target.value })} placeholder="https://maps.app.goo.gl/…" /></label>
          <p className="admin-hint">In Google Maps, open the place, press Share and copy the link. For the pin, right-click the place and click the numbers at the top of the menu. <a href={testLink} target="_blank" rel="noreferrer">Test the link <ExternalLink /></a></p>
        </div>
      </div>

      <div className="admin-visit__block">
        <div className="admin-visit__routes-head"><h3><Route /> How to reach ({form.routes.length})</h3><button className="admin-button admin-button--small" onClick={() => setForm({ ...form, routes: [...form.routes, emptyRoute()] })}><Plus /> Add route</button></div>
        <div className="admin-routes">
          {form.routes.map((route, index) => (
            <article key={index} className="admin-route">
              <header>
                <strong>{index + 1}. {route.from.en || route.from.bn || 'New route'}</strong>
                <div>
                  <button className="admin-icon-button" disabled={index === 0} onClick={() => moveRoute(index, -1)} aria-label="Move up"><ArrowUp /></button>
                  <button className="admin-icon-button" disabled={index === form.routes.length - 1} onClick={() => moveRoute(index, 1)} aria-label="Move down"><ArrowDown /></button>
                  <button className="admin-icon-button admin-danger" onClick={() => { if (window.confirm(`Remove the route from ${route.from.en || 'here'}?`)) setForm({ ...form, routes: form.routes.filter((_, i) => i !== index) }); }} aria-label="Remove route"><Trash2 /></button>
                </div>
              </header>
              <div className="admin-form">
                <div className="admin-form-grid">
                  <label>From (English)<input value={route.from.en} onChange={(event) => setRoute(index, { from: { ...route.from, en: event.target.value } })} placeholder="Barabazar" /></label>
                  <label>From (বাংলা)<input lang="bn" value={route.from.bn} onChange={(event) => setRoute(index, { from: { ...route.from, bn: event.target.value } })} placeholder="বরাবাজার" /></label>
                  <label>Distance (English)<input value={route.distance.en} onChange={(event) => setRoute(index, { distance: { ...route.distance, en: event.target.value } })} placeholder="12 km" /></label>
                  <label>Distance (বাংলা)<input lang="bn" value={route.distance.bn} onChange={(event) => setRoute(index, { distance: { ...route.distance, bn: event.target.value } })} placeholder="১২ কিমি" /></label>
                  <label>Time (English)<input value={route.time.en} onChange={(event) => setRoute(index, { time: { ...route.time, en: event.target.value } })} placeholder="about 30 min" /></label>
                  <label>Time (বাংলা)<input lang="bn" value={route.time.bn} onChange={(event) => setRoute(index, { time: { ...route.time, bn: event.target.value } })} placeholder="প্রায় ৩০ মিনিট" /></label>
                  <label>Travel by<select value={route.by} onChange={(event) => setRoute(index, { by: event.target.value })}>{Object.entries(BY_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
                  <label>Start place for Google Maps directions<input value={route.query} onChange={(event) => setRoute(index, { query: event.target.value })} placeholder="Barabazar, Purulia" /></label>
                </div>
                <div className="admin-steps">
                  <span>Steps of the way</span>
                  {route.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="admin-step">
                      <select aria-label="How" value={step.mode} onChange={(event) => setStep(index, stepIndex, { mode: event.target.value })}>{Object.entries(STEP_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
                      <input aria-label="Step in English" value={step.en} onChange={(event) => setStep(index, stepIndex, { en: event.target.value })} placeholder="Take a bus to Beldi" />
                      <input aria-label="Step in Bangla" lang="bn" value={step.bn} onChange={(event) => setStep(index, stepIndex, { bn: event.target.value })} placeholder="বাসে বেলডি" />
                      <button className="admin-icon-button admin-danger" onClick={() => setRoute(index, { steps: route.steps.filter((_, i) => i !== stepIndex) })} aria-label="Remove step"><X /></button>
                    </div>
                  ))}
                  <button className="admin-text-button" onClick={() => setRoute(index, { steps: [...route.steps, { mode: 'walk', en: '', bn: '' }] })}><Plus /> Add step</button>
                </div>
              </div>
            </article>
          ))}
          {!form.routes.length && <div className="admin-empty admin-empty--compact"><Route /><h3>No routes</h3><p>The “How to reach” part is hidden on the website until you add one.</p></div>}
        </div>
      </div>
      {dirty && <div className="admin-visit__sticky"><span>You have unsaved changes.</span><button className="admin-button" onClick={() => setForm(visitForm(records))}>Undo</button>{saveButton}</div>}
    </section>
  );
}

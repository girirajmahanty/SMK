import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { ImagePlus, X, CheckCircle2, Clock, LogIn, Upload, Trash2 } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';
import { shrinkImage, isImageFile } from '../imageTools.js';

const CATS = ['village', 'temple', 'procession'];
// "Add your photo" under the gallery. Anyone may click it; visitors who are not signed in are sent to the login page
// and brought back here. Signed-in members pick a photo, add a caption and category, and send it for an admin to approve.
export default function GalleryShare({ onChange }) {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const start = () => {
    if (!user) return navigate('/login', { state: { from: '/#gallery' } });
    setOpen(true);
  };

  return (
    <div className="gal-share">
      <p className="gal-share__hint">{t('galleryAdd.hint')}</p>
      <button className="gal-share__btn" onClick={start}>
        {user ? <ImagePlus /> : <LogIn />}
        {t('galleryAdd.button')}
      </button>
      {!user && <small className="gal-share__login">{t('galleryAdd.loginHint')}</small>}
      {open && user && <ShareDialog key={location.key} onClose={() => setOpen(false)} onChange={onChange} />}
    </div>
  );
}

function ShareDialog({ onClose, onChange }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [photo, setPhoto] = useState(null); // data URL after shrinking
  const [caption, setCaption] = useState('');
  const [cat, setCat] = useState('village');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null); // the sent photo
  const [mine, setMine] = useState([]);
  const [removing, setRemoving] = useState('');
  const fileRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => { api.myGalleryPhotos().then(setMine).catch(() => {}); }, [done]);

  // Esc closes; focus stays inside the dialog; the page behind does not scroll.
  useEffect(() => {
    const opener = document.activeElement;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => boxRef.current?.querySelector('button, input, textarea')?.focus());
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose();
      if (e.key === 'Tab') {
        const items = [...boxRef.current.querySelectorAll('button:not([disabled]), input, textarea, select')];
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); opener?.focus?.({ preventScroll: true }); };
  }, [busy, onClose]);

  const choose = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    if (!/^image\/(jpeg|png|webp|gif|heic|heif)$/i.test(file.type)) return setError(t('galleryAdd.notImage'));
    try {
      setPhoto(await shrinkImage(file));
    } catch (err) {
      console.error('Could not read the chosen photo', err);
      setError(t('galleryAdd.readFail'));
    }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!photo || !caption.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const sent = await api.sendGalleryPhoto({ data: photo, caption: caption.trim(), cat });
      setDone(sent);
      if (sent.status === 'approved') onChange?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // A member takes back one of their photos (waiting, or already in the gallery).
  const remove = async (p) => {
    if (!window.confirm(t('galleryAdd.removeConfirm'))) return;
    setRemoving(p.id);
    setError('');
    try {
      await api.deleteMyGalleryPhoto(p.id);
      setMine((list) => list.filter((item) => item.id !== p.id));
      if (p.status === 'approved') onChange?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setRemoving('');
    }
  };

  const again = () => { setDone(null); setPhoto(null); setCaption(''); setError(''); };

  return createPortal(
    <div className="share-dlg" role="dialog" aria-modal="true" aria-labelledby="share-dlg-title" onClick={() => !busy && onClose()}>
      <div className="share-dlg__box" ref={boxRef} onClick={(e) => e.stopPropagation()}>
        <button className="share-dlg__close" onClick={onClose} disabled={busy} aria-label={t('galleryAdd.close')}><X /></button>
        <h3 id="share-dlg-title"><ImagePlus /> {t('galleryAdd.title')}</h3>

        {done ? (
          <div className="share-dlg__done" role="status">
            <CheckCircle2 />
            <img src={photo} alt="" />
            <p>{t(done.status === 'approved' ? 'galleryAdd.doneAdmin' : 'galleryAdd.done')}</p>
            <div className="share-dlg__actions">
              <button type="button" className="share-dlg__ghost" onClick={onClose}>{t('galleryAdd.close')}</button>
              <button type="button" className="share-dlg__send" onClick={again}>{t('galleryAdd.another')}</button>
            </div>
          </div>
        ) : (
          <form onSubmit={send}>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif" onChange={choose} hidden />
            <button type="button" className={`share-dlg__drop ${photo ? 'has-photo' : ''}`} onClick={() => fileRef.current.click()} disabled={busy}>
              {photo ? <img src={photo} alt="" /> : <><Upload /><span>{t('galleryAdd.pick')}</span></>}
              {photo && <span className="share-dlg__change">{t('galleryAdd.change')}</span>}
            </button>

            <label className="share-dlg__field">
              <span>{t('galleryAdd.caption')}</span>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} rows={2} placeholder={t('galleryAdd.captionPh')} required disabled={busy} />
              <small>{caption.length} / 200</small>
            </label>

            <fieldset className="share-dlg__cats" disabled={busy}>
              <legend>{t('galleryAdd.cat')}</legend>
              {CATS.map((id) => (
                <label key={id} className={cat === id ? 'is-on' : ''}>
                  <input type="radio" name="share-cat" value={id} checked={cat === id} onChange={() => setCat(id)} />
                  {t(`gallery.${id}`)}
                </label>
              ))}
            </fieldset>

            {error && <p className="share-dlg__error" role="alert">{error}</p>}

            <div className="share-dlg__actions">
              <button type="button" className="share-dlg__ghost" onClick={onClose} disabled={busy}>{t('galleryAdd.cancel')}</button>
              <button type="submit" className="share-dlg__send" disabled={!photo || !caption.trim() || busy}>
                {busy ? t('galleryAdd.sending') : user.role === 'admin' ? t('galleryAdd.button') : t('galleryAdd.send')}
              </button>
            </div>
          </form>
        )}

        {mine.length > 0 && (
          <div className="share-dlg__mine">
            <h4>{t('galleryAdd.mine')}</h4>
            <ul>
              {mine.map((p) => (
                <li key={p.id} title={p.caption}>
                  <span className="share-dlg__thumb">
                    <img src={p.url} alt={p.caption} loading="lazy" />
                    <button type="button" className="share-dlg__remove" onClick={() => remove(p)} disabled={removing === p.id} aria-label={`${t('galleryAdd.remove')}: ${p.caption}`} title={t('galleryAdd.remove')}><Trash2 /></button>
                  </span>
                  <span className={`share-dlg__status is-${p.status}`}>
                    {p.status === 'approved' ? <CheckCircle2 /> : <Clock />}
                    {t(p.status === 'approved' ? 'galleryAdd.approved' : 'galleryAdd.pending')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

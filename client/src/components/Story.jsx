import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote, Landmark, Hourglass, Eye, Users, House, ScrollText, Images, ChevronDown, Flame, Hammer, Music2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { showGalleryCategory } from './Gallery.jsx';
import { useLang } from '../i18n.jsx';
import { village } from '../village.js';
import Reveal from './Reveal.jsx';
import RichHead from './RichHead.jsx';
import { pic } from '../responsive.js';
import Seal from './Seal.jsx';
import BgFx from './BgFx.jsx';

// The village song, played in the About section (client/public/audio).
const VILLAGE_SONG = '/audio/village-song.mp3';

// Counts up from `from` to `value` the first time it scrolls into view.
function CountOnView({ value, from = 0, suffix = '' }) {
  const ref = useRef(null);
  const [n, setN] = useState(from);
  useEffect(() => {
    let frame;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 1600, 1);
        setN(Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3))));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, [value, from]);
  return <span ref={ref}>{n}{suffix}</span>;
}

// "SINCE 1901 · SMK ·" written around a circle that slowly turns.
function SinceRing({ year, label }) {
  const text = `${label} ${year} • SMK • ${label} ${year} • SMK • `;
  return (
    <svg className="story2__ring" viewBox="0 0 200 200" aria-hidden="true">
      <defs><path id="since-ring" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" /></defs>
      <text><textPath href="#since-ring" textLength="508">{text}</textPath></text>
    </svg>
  );
}

// A story photo that opens the gallery on its own category; "See more photos" rises in under the mouse.
function StoryPhoto({ img, cat, sizes, delay, side }) {
  const { t, pick } = useLang();
  return (
    <Reveal delay={delay} className={`story2__frame story2__frame--${side ? 'side' : 'main'}`}>
      <figure>
        <img {...pic(img.src)} sizes={sizes} alt={pick(img.caption)} loading="lazy" style={{ objectPosition: img.position }} />
        <figcaption>{pick(img.caption)}</figcaption>
        <Link to="/#gallery" className="story2__open" onClick={() => showGalleryCategory(cat)} aria-label={`${t('story.morePhotos')}: ${t(`gallery.${cat}`)}`}>
          <span className="story2__more"><Images /> {t('story.morePhotos')}</span>
        </Link>
      </figure>
    </Reveal>
  );
}

export default function Story({ visits = null }) {
  const { t, pick, lang } = useLang();
  const [more, setMore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [musicUnavailable, setMusicUnavailable] = useState(false);
  const sectionRef = useRef(null);
  const audioRef = useRef(null);
  const isInAbout = useRef(false);
  const userPaused = useRef(false);
  const manualPlayback = useRef(false);
  const reducedMotion = useRef(false);
  const songEnded = useRef(false);
  const stopWaitingForTap = useRef(null);

  // Browsers never play sound on their own before the visitor has tapped, clicked or pressed a key on the page.
  // When the song is blocked, the first such tap anywhere starts it (if the About section is still on screen).
  const startOnFirstTap = () => {
    if (stopWaitingForTap.current) return;
    const events = ['pointerdown', 'touchend', 'keydown', 'click'];
    const stop = () => {
      events.forEach((name) => window.removeEventListener(name, onTap, true));
      stopWaitingForTap.current = null;
    };
    const onTap = (event) => {
      stop();
      // A tap on the song's own buttons is handled by those buttons (else play would start, then toggle off).
      if (event.target instanceof Element && event.target.closest('.story2__music')) return;
      if (isInAbout.current) startPlayback();
    };
    events.forEach((name) => window.addEventListener(name, onTap, true));
    stopWaitingForTap.current = stop;
  };

  // Plays the village song; if the browser blocks it, the button asks for a tap and the first tap starts it.
  const startPlayback = (manual = false) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (manual) {
      userPaused.current = false;
      manualPlayback.current = true;
      songEnded.current = false;
    } else if (userPaused.current || songEnded.current || (reducedMotion.current && !manualPlayback.current)) {
      return;
    }
    if (!audio.paused) return;

    setNeedsTap(false);
    audio.play().catch((error) => {
      if (error.name === 'NotAllowedError') {
        if (isInAbout.current || manual) setNeedsTap(true);
        startOnFirstTap();
      } else if (error.name !== 'AbortError') {
        setMusicUnavailable(true);
      }
    });
  };

  useEffect(() => {
    const section = sectionRef.current;
    const audio = audioRef.current;
    if (!section || !audio) return undefined;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = motionPreference.matches;

    const onPlaying = () => {
      songEnded.current = false;
      setIsPlaying(true);
      setNeedsTap(false);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      songEnded.current = true;
      setIsPlaying(false);
    };
    const onError = () => {
      setMusicUnavailable(true);
      setIsPlaying(false);
      setNeedsTap(false);
    };
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    // Plays while the About section fills the middle of the screen, pauses when the visitor scrolls away.
    // (Checking the middle band, not the edges: the section starts right below the full-screen hero,
    // so at the top of the page its edge already touches the screen.)
    const observer = new IntersectionObserver(([entry]) => {
      isInAbout.current = entry.isIntersecting;
      if (entry.isIntersecting) {
        startPlayback();
      } else {
        audio.pause();
        setNeedsTap(false);
      }
    }, { rootMargin: '-35% 0px -35% 0px', threshold: 0 });

    const handleMotionChange = (event) => {
      reducedMotion.current = event.matches;
      if (event.matches && !manualPlayback.current) audio.pause();
      else if (isInAbout.current) startPlayback();
    };

    observer.observe(section);
    motionPreference.addEventListener('change', handleMotionChange);

    return () => {
      observer.disconnect();
      motionPreference.removeEventListener('change', handleMotionChange);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      stopWaitingForTap.current?.();
      isInAbout.current = false;
      audio.pause();
    };
  }, []);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      userPaused.current = true;
      manualPlayback.current = true;
      audio.pause();
    } else {
      startPlayback(true);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const est = village.established;
  const timelineYear = est && (lang === 'bn' ? new Intl.NumberFormat('bn-IN', { useGrouping: false }).format(est) : est);
  const stats = [
    est && { Icon: Landmark, value: est, from: est - 120, label: t('story.established') },
    est && { Icon: Hourglass, value: new Date().getFullYear() - est, suffix: '+', label: t('story.years') },
    village.families && { Icon: House, value: village.families, label: t('stat.families') },
    village.population && { Icon: Users, value: village.population, label: t('stat.population') },
    visits && { Icon: Eye, value: visits, label: t('story.visits') },
  ].filter(Boolean).slice(0, 3);
  const { main, side } = village.storyImages;

  return (
    <section id="story" ref={sectionRef} className="band band--ivory story-sec">
      <BgFx glows alpana />
      <div className="story2">
        {/* Photo collage */}
        <div className="story2__media">
          <span className="story2__pattern" aria-hidden="true" />
          <StoryPhoto img={main} cat="procession" sizes="(max-width: 900px) 80vw, 480px" />
          <StoryPhoto img={side} cat="temple" sizes="(max-width: 900px) 45vw, 300px" delay={250} side />
          {est && (
            <Reveal delay={450} className="story2__medallion">
              <SinceRing year={est} label={t('story.since')} />
              <Seal size={86} className="story2__logo" shine />
            </Reveal>
          )}
        </div>

        {/* Text */}
        <div className={`story2__content ${more ? 'is-more' : ''}`}>
          <RichHead eyebrow={t('story.eyebrow')} title={t('story.title')} Icon={ScrollText} align="left" className="story2__head" />

          {village.story.map((p, i) => (
            <Reveal key={i} delay={i * 110} as="p" className={`story2__p ${i === 0 ? 'dropcap' : 'story2__p--extra'}`}>{pick(p)}</Reveal>
          ))}
          {/* phones: the rest of the story opens on request */}
          {village.story.length > 1 && (
            <button type="button" className="story2__readmore" onClick={() => setMore(!more)} aria-expanded={more}>
              {t(more ? 'story.readLess' : 'story.readMore')} <ChevronDown />
            </button>
          )}

          {village.storyQuote && (
            <Reveal as="blockquote" className="story2__quote">
              <Quote className="story2__quote-icon" />
              <p>{pick(village.storyQuote)}</p>
            </Reveal>
          )}

          <div className={`story2__music${isPlaying ? ' is-playing' : ''}${musicUnavailable ? ' is-unavailable' : ''}`}>
            {/* preload="none": the song (about 12 MB) downloads only when it starts playing */}
            <audio ref={audioRef} src={VILLAGE_SONG} preload="none" />
            <div className="story2__music-controls">
              <span className="story2__music-icon" aria-hidden="true"><Music2 /></span>
              <span className="story2__music-status" role="status" aria-live="polite">
                <span className="story2__music-dot" aria-hidden="true" />
                {musicUnavailable ? t('story.musicUnavailable') : isPlaying ? t('story.musicPlaying') : t('story.musicName')}
              </span>
              <div className="story2__music-actions">
                <button
                  type="button"
                  className="story2__music-btn story2__music-btn--play"
                  onClick={togglePlayback}
                  disabled={musicUnavailable}
                  aria-label={isPlaying ? t('story.musicPause') : needsTap ? t('story.musicTap') : t('story.musicPlay')}
                >
                  {isPlaying ? <Pause /> : <Play />}
                  <span>{musicUnavailable ? t('story.musicUnavailable') : needsTap ? t('story.musicTap') : isPlaying ? t('story.musicPause') : t('story.musicPlay')}</span>
                </button>
                <button
                  type="button"
                  className="story2__music-btn story2__music-btn--mute"
                  onClick={toggleMute}
                  disabled={musicUnavailable}
                  aria-label={isMuted ? t('story.musicUnmute') : t('story.musicMute')}
                  aria-pressed={isMuted}
                >
                  {isMuted ? <VolumeX /> : <Volume2 />}
                </button>
              </div>
            </div>
          </div>

          {/* Three steps taken from the story itself: the emblem, the yearly puja, the new temple */}
          {est && (
            <Reveal as="ol" className="story2__timeline">
              <li style={{ '--k': 0 }}><span className="story2__tl-dot"><Landmark /></span><strong>{timelineYear}</strong><span>{t('story.tl1')}</span></li>
              <li style={{ '--k': 1 }}><span className="story2__tl-dot"><Flame /></span><strong>{t('story.tl2Year')}</strong><span>{t('story.tl2')}</span></li>
              <li style={{ '--k': 2 }}><span className="story2__tl-dot"><Hammer /></span><strong>{t('story.tl3Year')}</strong><span>{t('story.tl3')}</span></li>
            </Reveal>
          )}

          <div className="story2__stats">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 120} className="story2__stat">
                <span className="story2__stat-icon"><s.Icon /></span>
                <strong><CountOnView value={s.value} from={s.from} suffix={s.suffix} /></strong>
                <span className="story2__stat-label">{s.label}</span>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <a href="#life" className="story2__cta">{t('story.cta')} <ArrowRight /></a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

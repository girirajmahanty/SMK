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

const YOUTUBE_VIDEO_ID = 'gi_rDssK6cg';
let youtubeApiPromise;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const script = document.querySelector('script[src="https://www.youtube.com/iframe_api"]') || document.createElement('script');
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve(window.YT);
    };
    script.onerror = () => {
      youtubeApiPromise = null;
      reject(new Error('Unable to load the YouTube player'));
    };
    if (!script.src) {
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

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
  const [playerReady, setPlayerReady] = useState(false);
  const [musicUnavailable, setMusicUnavailable] = useState(false);
  const sectionRef = useRef(null);
  const playerContainerRef = useRef(null);
  const playerRef = useRef(null);
  const isInAbout = useRef(false);
  const userPaused = useRef(false);
  const manualPlayback = useRef(false);
  const reducedMotion = useRef(false);
  const songEnded = useRef(false);
  const playAttempt = useRef(0);
  const pendingAttempt = useRef(null);

  const clearPendingAttempt = () => {
    if (pendingAttempt.current !== null) {
      window.clearTimeout(pendingAttempt.current);
      pendingAttempt.current = null;
    }
  };

  const startPlayback = (manual = false) => {
    const player = playerRef.current;
    if (!player) return;

    if (manual) {
      userPaused.current = false;
      manualPlayback.current = true;
      songEnded.current = false;
    } else if (userPaused.current || songEnded.current || (reducedMotion.current && !manualPlayback.current)) {
      return;
    }

    if (player.getPlayerState() === window.YT.PlayerState.PLAYING || pendingAttempt.current !== null) return;

    const attempt = ++playAttempt.current;
    setNeedsTap(false);
    try {
      player.playVideo();
      pendingAttempt.current = window.setTimeout(() => {
        pendingAttempt.current = null;
        if (playAttempt.current === attempt && isInAbout.current && playerRef.current?.getPlayerState() !== window.YT.PlayerState.PLAYING) {
          setNeedsTap(true);
        }
      }, 2500);
    } catch (error) {
      if (error.name === 'NotAllowedError') setNeedsTap(true);
      else setMusicUnavailable(true);
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !playerContainerRef.current) return undefined;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = motionPreference.matches;
    let active = true;

    loadYouTubeApi().then((YT) => {
      if (!active) return;
      playerRef.current = new YT.Player(playerContainerRef.current, {
        width: 360,
        height: 200,
        videoId: YOUTUBE_VIDEO_ID,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 0,
          controls: 1,
          enablejsapi: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (!active) {
              event.target.destroy();
              return;
            }
            setPlayerReady(true);
            if (isInAbout.current) startPlayback();
          },
          onStateChange: (event) => {
            if (!active) return;
            if (event.data === YT.PlayerState.PLAYING) {
              clearPendingAttempt();
              songEnded.current = false;
              setIsPlaying(true);
              setNeedsTap(false);
            } else {
              if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) clearPendingAttempt();
              setIsPlaying(false);
              if (event.data === YT.PlayerState.ENDED) songEnded.current = true;
            }
          },
          onError: () => {
            if (!active) return;
            clearPendingAttempt();
            setMusicUnavailable(true);
            setNeedsTap(false);
          },
        },
      });
    }).catch(() => {
      if (active) setMusicUnavailable(true);
    });

    const observer = new IntersectionObserver(([entry]) => {
      isInAbout.current = entry.isIntersecting;
      if (entry.isIntersecting) {
        startPlayback();
      } else {
        playerRef.current?.pauseVideo();
        playAttempt.current += 1;
        clearPendingAttempt();
        setNeedsTap(false);
      }
    }, { threshold: 0 });

    const handleMotionChange = (event) => {
      reducedMotion.current = event.matches;
      if (event.matches && !manualPlayback.current) {
        playerRef.current?.pauseVideo();
        playAttempt.current += 1;
        clearPendingAttempt();
      } else if (isInAbout.current) {
        startPlayback();
      }
    };

    observer.observe(section);
    motionPreference.addEventListener('change', handleMotionChange);

    return () => {
      active = false;
      observer.disconnect();
      motionPreference.removeEventListener('change', handleMotionChange);
      isInAbout.current = false;
      playAttempt.current += 1;
      clearPendingAttempt();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  const togglePlayback = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      userPaused.current = true;
      manualPlayback.current = true;
      playAttempt.current += 1;
      clearPendingAttempt();
      playerRef.current.pauseVideo();
    } else {
      startPlayback(true);
    }
  };

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player) return;
    if (isMuted) player.unMute();
    else player.mute();
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
            <div className="story2__youtube-player" ref={playerContainerRef} />
            <div className="story2__music-controls">
              <span className="story2__music-icon" aria-hidden="true"><Music2 /></span>
              <span className="story2__music-status" role="status" aria-live="polite">
                <span className="story2__music-dot" aria-hidden="true" />
                {musicUnavailable ? t('story.musicUnavailable') : !playerReady ? t('story.musicLoading') : isPlaying ? t('story.musicPlaying') : t('story.musicName')}
              </span>
              <div className="story2__music-actions">
                <button
                  type="button"
                  className="story2__music-btn story2__music-btn--play"
                  onClick={togglePlayback}
                  disabled={!playerReady || musicUnavailable}
                  aria-label={isPlaying ? t('story.musicPause') : needsTap ? t('story.musicTap') : t('story.musicPlay')}
                >
                  {isPlaying ? <Pause /> : <Play />}
                  <span>{musicUnavailable ? t('story.musicUnavailable') : !playerReady ? t('story.musicLoading') : needsTap ? t('story.musicTap') : isPlaying ? t('story.musicPause') : t('story.musicPlay')}</span>
                </button>
                <button
                  type="button"
                  className="story2__music-btn story2__music-btn--mute"
                  onClick={toggleMute}
                  disabled={!playerReady || musicUnavailable}
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

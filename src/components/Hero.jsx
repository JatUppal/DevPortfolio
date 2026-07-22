import { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { SiGithub } from 'react-icons/si';
import { BsLinkedin } from 'react-icons/bs';
import { Mail } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';

const FULL_HEADING = "Hi! I'm Jatin";
const TYPE_SPEED = 50;
const TYPING_DURATION_MS = FULL_HEADING.length * TYPE_SPEED;
const FADE_START_BUFFER_MS = 150;

function Hero() {
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [typingDone, setTypingDone] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) return;
    const t = setTimeout(
      () => setTypingDone(true),
      TYPING_DURATION_MS + FADE_START_BUFFER_MS
    );
    return () => clearTimeout(t);
  }, [reduceMotion]);

  return (
    <section id="hero" className="hero-section d-flex align-items-center">
      <Container className="text-center">
        {reduceMotion ? (
          <h1 className="display-3 fw-bold hero-heading">{FULL_HEADING}</h1>
        ) : (
          <TypeAnimation
            sequence={[FULL_HEADING]}
            wrapper="h1"
            cursor={false}
            speed={TYPE_SPEED}
            repeat={0}
            className="display-3 fw-bold hero-heading"
          />
        )}
        <div className={`hero-reveal${typingDone ? ' hero-reveal--play' : ''}`}>
          <p className="lead mt-3 hero-subtitle">
            Software Engineer · Backend & Full Stack · AI Engineer
          </p>
          <p className="text-muted mt-2 hero-tagline">
            Building scalable, production-grade systems across cloud, AI, and distributed infrastructure.
          </p>
          <div className="mt-4 d-flex justify-content-center gap-3 hero-actions">
            <Button
              variant="outline-light"
              className="hero-projects-btn"
              onClick={() => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="brand-portfolio">View Projects</span>
            </Button>
            <Button
              variant="light"
              className="liquid-glass-btn"
              href={`${import.meta.env.BASE_URL}resume.pdf`}
              target="_blank"
            >
              Download Resume
            </Button>
          </div>
          <div className="mt-4 d-flex justify-content-center gap-4 fs-4 hero-actions">
            <a href="https://github.com/JatUppal" target="_blank" rel="noreferrer" aria-label="GitHub">
              <SiGithub />
            </a>
            <a href="https://www.linkedin.com/in/jatin-uppal/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <BsLinkedin />
            </a>
            <a href="mailto:jatinuppal55@gmail.com" aria-label="Email">
              <Mail strokeWidth={1.5} size={28} />
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Hero;

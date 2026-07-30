import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, Collapse, OverlayTrigger, Popover } from 'react-bootstrap';
import { FaGraduationCap, FaBriefcase, FaCode, FaFileAlt, FaChevronDown, FaChevronUp, FaExternalLinkAlt } from 'react-icons/fa';
import { getTypeStyle, getTypeLabel, timelineTypes } from '../data/timeline';

const iconMap = {
  FaGraduationCap,
  FaBriefcase,
  FaCode,
  FaFileAlt,
};

function TimelineEntry({ entry, rootRef, orientation = 'vertical', lane, leftPercent, index = 0 }) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const ref = useRef(null);
  const style = getTypeStyle(entry.type);
  const Icon = iconMap[timelineTypes[entry.type]?.icon];
  const hasExpanded = !!entry.expanded;
  const collapseHighlights = entry.collapseHighlights && entry.highlights;
  const certificateHref = entry.certificateUrl
    ? /^https?:\/\//.test(entry.certificateUrl)
      ? entry.certificateUrl
      : `${import.meta.env.BASE_URL}${entry.certificateUrl.replace(/^\//, '')}`
    : null;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      {
        threshold: 0.2,
        root: rootRef?.current || null,
      }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootRef]);

  const entryClass = `timeline-entry${
    orientation === 'horizontal' ? ` timeline-entry--horizontal timeline-entry--${lane || 'top'}` : ''
  }${visible ? ' visible' : ''}`;

  // `compactTop` is a negative margin that overlaps this entry with the row
  // above it. It only makes sense when there IS a row above: applied to the
  // first rendered entry (e.g. once a filter leaves it alone at the top) it
  // pulls the card above the scroll container's top edge, where scrollTop
  // can't reach it. Skip it at index 0.
  const compactTop = index > 0 ? entry.compactTop : null;

  const entryStyle =
    orientation === 'horizontal' && leftPercent != null
      ? { left: `${leftPercent}%` }
      : orientation === 'vertical' && compactTop
      ? { marginTop: compactTop }
      : undefined;

  return (
    <div ref={ref} className={entryClass} style={entryStyle}>
      {Icon && (
        <div className="timeline-dot" style={{ background: style.color }}>
          <Icon size={16} />
        </div>
      )}
      <Card
        className="timeline-entry-card shadow-sm"
        style={{ borderLeftColor: style.color, borderLeftWidth: '4px', borderLeftStyle: 'solid' }}
      >
        <Card.Body>
          <div className="mb-2">
            <small className="text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>
              {getTypeLabel(entry.type)}
            </small>
          </div>
          <Card.Title className="fw-bold mb-1">
            {entry.liveUrl ? (
              <OverlayTrigger
                placement="top"
                trigger={['hover', 'focus']}
                delay={{ show: 200, hide: 100 }}
                overlay={
                  <Popover className="link-preview-popover" id={`preview-timeline-${entry.id}`}>
                    <Popover.Body>
                      <img
                        src={`${import.meta.env.BASE_URL}${entry.previewImage.replace(/^\//, '')}`}
                        alt={`${entry.title} preview`}
                      />
                    </Popover.Body>
                  </Popover>
                }
              >
                <a
                  href={entry.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="title-external-link"
                >
                  {entry.title}
                </a>
              </OverlayTrigger>
            ) : (
              entry.title
            )}
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted d-flex align-items-center gap-2">
            {entry.subtitleLogo && (
              <img
                src={`${import.meta.env.BASE_URL}${entry.subtitleLogo.replace(/^\//, '')}`}
                alt=""
                aria-hidden="true"
                style={{ height: '1.4em', width: 'auto', flexShrink: 0 }}
              />
            )}
            <span>{entry.subtitle}</span>
          </Card.Subtitle>
          <div className="small text-muted mb-2">{entry.period}</div>
          <Card.Text>{entry.description}</Card.Text>
          {entry.highlights && (
            collapseHighlights ? (
              <>
                <Collapse in={highlightsOpen}>
                  <div>
                    <ul className="brand-bullets brand-bullets--red small mb-2">
                      {entry.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                </Collapse>
                <div className="mt-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold category-shine"
                    onClick={() => setHighlightsOpen(!highlightsOpen)}
                    aria-expanded={highlightsOpen}
                    style={{ color: style.color, '--shine-color': style.color }}
                  >
                    {highlightsOpen ? (
                      <>
                        See less <FaChevronUp size={10} />
                      </>
                    ) : (
                      <>
                        See more <FaChevronDown size={10} />
                      </>
                    )}
                  </button>
                  {entry.certificateUrl && (
                    <a
                      href={certificateHref}
                      target="_blank"
                      rel="noreferrer"
                      className="certificate-pill"
                    >
                      <span>View certificate</span>
                      <FaFileAlt size={10} />
                    </a>
                  )}
                </div>
              </>
            ) : entry.type === 'experience' ? (
              <ul className="brand-bullets brand-bullets--green small mb-2">
                {entry.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            ) : entry.type === 'certification' ? (
              <ul className="brand-bullets brand-bullets--red small mb-2">
                {entry.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            ) : (
              <ul className="small mb-2 ps-3">
                {entry.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )
          )}

          {hasExpanded && (
            <>
              <Collapse in={expanded}>
                <div>
                  <div className="mt-3 pt-3 border-top">
                    <div className="fw-semibold small mb-2">{entry.expanded.label}</div>
                    <ul className="small mb-0 ps-3">
                      {entry.expanded.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Collapse>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 mt-2 text-decoration-none"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                style={{ color: style.color }}
              >
                {expanded ? (
                  <>
                    <FaChevronUp size={10} /> Show less
                  </>
                ) : (
                  <>
                    <FaChevronDown size={10} /> Show {entry.expanded.label.toLowerCase()}
                  </>
                )}
              </button>
            </>
          )}

          {(entry.link || entry.publication) && (
            <div className="mt-2 d-flex align-items-center justify-content-between flex-wrap gap-2">
              {entry.link && (
                <Link
                  to={entry.link.replace(/^\/#/, '')}
                  state={{ from: 'resume' }}
                  className="small fw-semibold text-decoration-none category-shine"
                  style={{ '--shine-color': style.color }}
                >
                  See details →
                </Link>
              )}
              {entry.publication && (
                <a
                  href={entry.publication}
                  target="_blank"
                  rel="noreferrer"
                  className="publication-pill"
                >
                  <span>See publication</span>
                  <FaExternalLinkAlt size={9} />
                </a>
              )}
            </div>
          )}

          {entry.certificateUrl && !collapseHighlights && (
            <div className="d-flex justify-content-end mt-2">
              <a
                href={certificateHref}
                target="_blank"
                rel="noreferrer"
                className="certificate-pill"
              >
                <span>View certificate</span>
                <FaFileAlt size={10} />
              </a>
            </div>
          )}

        </Card.Body>
      </Card>
    </div>
  );
}

export default TimelineEntry;

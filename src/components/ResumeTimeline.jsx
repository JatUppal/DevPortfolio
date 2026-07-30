import { useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';
import { LuLayers, LuGraduationCap, LuBriefcase, LuCodeXml, LuFileText } from 'react-icons/lu';
import TimelineEntry from './TimelineEntry';
import timeline, { timelineYears, datePercent } from '../data/timeline';

const filters = [
  { value: 'All',           label: 'All',            Icon: LuLayers,        color: '#6c757d' },
  { value: 'education',     label: 'Education',      Icon: LuGraduationCap, color: '#4fc3f7' },
  { value: 'experience',    label: 'Experience',     Icon: LuBriefcase,     color: '#81c784' },
  { value: 'project',       label: 'Projects',       Icon: LuCodeXml,       color: '#ffb74d' },
  { value: 'certification', label: 'Certifications', Icon: LuFileText,      color: '#ef5350' },
];

function ResumeTimeline({ orientation = 'vertical' }) {
  const [filter, setFilter] = useState('All');
  const containerRef = useRef(null);
  const isHorizontal = orientation === 'horizontal';

  const filtered = timeline.filter(e => filter === 'All' || e.type === filter);
  const entries = isHorizontal
    ? [...filtered].sort(
        (a, b) => (a.endYear - b.endYear) || (a.endMonth - b.endMonth)
      )
    : filtered;

  const headingClass = isHorizontal ? 'display-5 fw-bold mb-0' : 'display-6 fw-bold mb-0';
  const buttonSize = undefined; // default size on both modes (down from 'lg' on horizontal)

  return (
    <>
      <div className="text-center mb-3">
        <h2 className={headingClass}>Timeline</h2>
      </div>
      <div className="d-flex justify-content-end mb-3 flex-wrap gap-2">
        {isHorizontal ? (
          <Button
            variant="light"
            className="liquid-glass-btn"
            size={buttonSize}
            href={`${import.meta.env.BASE_URL}resume.pdf`}
            target="_blank"
            download
          >
            <FaDownload /> Download Resume
          </Button>
        ) : (
          <Button
            variant="light"
            className="liquid-glass-btn"
            href={`${import.meta.env.BASE_URL}resume.pdf`}
            target="_blank"
          >
            View Resume
          </Button>
        )}
      </div>
      <div className="d-flex align-items-center gap-2 flex-wrap mb-4">
        <small className="text-muted me-1 resume-filter-label">Filter by:</small>
        {filters.map(f => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              className={`resume-filter-chip${active ? ' resume-filter-chip--active' : ''}`}
              style={{ '--chip-color': f.color }}
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
            >
              <f.Icon size={16} />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {entries.length === 0 ? (
        <p className="text-muted text-center">No entries match this filter.</p>
      ) : orientation === 'horizontal' ? (
        <div ref={containerRef} className="timeline-container timeline-container--horizontal">
          <div className="timeline-horizontal-inner">
            {timelineYears.map(y => {
              // datePercent clamps to 0 for years before TIMELINE_START.
              // Nudge clamped ticks to 3% so the centered label isn't
              // clipped by the container's left edge.
              const raw = datePercent(y, 1);
              const pos = raw <= 0 ? 3 : raw;
              return (
                <div
                  key={y}
                  className="timeline-year-tick"
                  data-year={y}
                  style={{ left: `${pos}%` }}
                />
              );
            })}
            <div className="timeline-horizontal-line" />
            {entries.map((entry, i) => (
              <TimelineEntry
                key={entry.id}
                entry={entry}
                orientation="horizontal"
                lane={entry.lane || (i % 2 === 0 ? 'top' : 'bottom')}
                leftPercent={datePercent(entry.endYear, entry.endMonth + 0.5)}
                rootRef={containerRef}
              />
            ))}
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="timeline-container timeline-container--vertical">
          <div className="timeline-inner-vertical">
            {entries.map((entry, i) => (
              <TimelineEntry
                key={entry.id}
                entry={entry}
                orientation="vertical"
                index={i}
                rootRef={containerRef}
              />
            ))}
            <div className="timeline-line-vertical" aria-hidden="true" />
          </div>
        </div>
      )}
    </>
  );
}

export default ResumeTimeline;

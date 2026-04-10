import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { Modal } from 'react-bootstrap';
import '../index.css';

const API_URL = 'http://localhost:3001/api/wellness';

const clampScore = (value) => Math.max(0, Math.min(10, Number(value) || 0));

const averageScores = (scores) => {
    if (!scores.length) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

const getEntryDate = (entry) => entry.date || entry.created_at || new Date().toISOString();

const formatShortDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Recent';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const normalizeEntry = (entry, index) => {
    const sleep = clampScore(entry.sleep);
    const stress = clampScore(entry.stress);
    const energy = clampScore(entry.energy);
    const motivation = clampScore(entry.motivation);
    const mood = clampScore(entry.mood);
    const stressBalance = clampScore(11 - stress);
    const date = getEntryDate(entry);
    const composite = averageScores([sleep, stressBalance, energy, motivation, mood]);

    return {
        ...entry,
        id: entry.id ?? `${date}-${index}`,
        date,
        sleep,
        stress,
        stressBalance,
        energy,
        motivation,
        mood,
        composite,
    };
};

const METRIC_DEETS = {
    sleep: {
        title: 'Sleep Quality',
        color: 'var(--nscc-blue)',
        source: 'Using your existing sleep score from each wellness entry.',
        metric: 'Measured directly from your 1-10 sleep quality slider.',
        why: 'Restorative sleep strongly affects energy, focus, and day-to-day resilience.',
    },
    stressBalance: {
        title: 'Stress Balance',
        color: 'var(--terra)',
        source: 'Derived from your current stress score so that a higher dashboard value means better balance.',
        metric: 'Calculated as 11 - stress, based on your existing 1-10 stress slider.',
        why: 'This keeps the dashboard consistent, where higher scores always indicate stronger wellbeing.',
    },
    energy: {
        title: 'Daily Energy',
        color: 'var(--slate)',
        source: 'Using your existing energy score from each wellness entry.',
        metric: 'Measured directly from your 1-10 energy slider.',
        why: 'Energy levels are a practical signal for capacity, focus, and recovery.',
    },
    motivation: {
        title: 'Motivation',
        color: 'var(--amber)',
        source: 'Using your existing motivation score from each wellness entry.',
        metric: 'Measured directly from your 1-10 motivation slider.',
        why: 'Motivation reflects readiness to engage with classes, routines, and goals.',
    },
    mood: {
        title: 'Mood',
        color: 'var(--nscc-teal)',
        source: 'Using your existing mood score from each wellness entry.',
        metric: 'Measured directly from your 1-10 mood slider.',
        why: 'Mood provides a simple high-level snapshot of emotional wellbeing over time.',
    },
};

const PillarProgressBar = ({ val, color, label }) => (
    <div className="pillar-progress-wrap">
        <div className="pillar-progress-head">
            <span className="p-avg-label">{label}</span>
            <span className="p-avg-val" style={{ color }}>{val.toFixed(1)}</span>
        </div>
        <div className="pillar-progress-track">
            <div className="pillar-progress-fill" style={{ width: `${val * 10}%`, backgroundColor: color }}></div>
        </div>
    </div>
);

const MiniPillarBarChart = ({ history, attr, color }) => {
    if (!history.length) return null;

    const last7 = history.slice(-7);
    const maxVal = 10;
    const barWidth = 6;
    const gap = 4;
    const height = 30;
    const width = (barWidth + gap) * 7 - gap;

    return (
        <div className="mini-bar-wrap">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {last7.map((entry, index) => {
                    const value = clampScore(entry[attr]);
                    const barHeight = (value / maxVal) * height;
                    const x = index * (barWidth + gap);
                    const y = height - barHeight;
                    const isLatest = index === last7.length - 1;

                    return (
                        <rect
                            key={`${attr}-${entry.id}-${index}`}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill={isLatest ? color : 'var(--parchment)'}
                            rx="2"
                            style={{ opacity: isLatest ? 1 : 0.4 + (index * 0.08) }}
                        />
                    );
                })}
            </svg>
        </div>
    );
};

const MonthlyProgressionChart = ({ data }) => {
    if (data.length < 2) return <div className="no-data">Add at least two entries to see your trend.</div>;

    const width = 400;
    const height = 140;
    const padding = 30;
    const maxVal = 10;
    const smoothedData = data.map((entry, index) => {
        const windowSize = 3;
        const start = Math.max(0, index - Math.floor(windowSize / 2));
        const end = Math.min(data.length, start + windowSize);
        const window = data.slice(start, end);
        const rollingAvg = averageScores(window.map((item) => item.composite));

        return { ...entry, rollingAvg };
    });

    const getPoints = (attr) => smoothedData.map((entry, index) => {
        const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((entry[attr] / maxVal) * (height - padding * 2) + padding);
        return `${x},${y}`;
    }).join(' ');

    const rawPoints = getPoints('composite');
    const rollingPoints = getPoints('rollingAvg');

    return (
        <div className="progression-chart-wrap">
            <svg viewBox={`0 0 ${width} ${height}`} className="progression-svg" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--nscc-teal)" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="var(--nscc-teal)" stopOpacity="0" />
                    </linearGradient>
                </defs>

                <path d={`M ${padding},${height - padding} L ${rollingPoints} L ${width - padding},${height - padding} Z`} fill="url(#lineGrad)" />
                <polyline fill="none" stroke="var(--parchment)" strokeWidth="1" strokeDasharray="3,2" points={rawPoints} />
                <polyline fill="none" stroke="var(--nscc-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={rollingPoints} className="trend-line-path" />

                {smoothedData.map((entry, index) => {
                    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
                    const y = height - ((entry.rollingAvg / maxVal) * (height - padding * 2) + padding);
                    return <circle key={`trend-${entry.id}-${index}`} cx={x} cy={y} r="3" fill="var(--warm-white)" stroke="var(--nscc-blue)" strokeWidth="1.5" />;
                })}
            </svg>

            <div className="chart-labels">
                <span className="chart-label-start">{formatShortDate(data[0].date)}</span>
                <span className="chart-label-info">3-Entry Rolling Trend</span>
                <span className="chart-label-end">{formatShortDate(data[data.length - 1].date)}</span>
            </div>
        </div>
    );
};

export default function Home() {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    const [history, setHistory] = useState([]);
    const [avgRange, setAvgRange] = useState('7d');
    const [loading, setLoading] = useState(true);
    const [showInfo, setShowInfo] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadHistory = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const entries = await response.json();
                const normalizedHistory = Array.isArray(entries)
                    ? entries
                        .map(normalizeEntry)
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                    : [];

                setHistory(normalizedHistory);
            } catch (fetchError) {
                console.error('Failed to fetch wellness history:', fetchError);
                setHistory([]);
                setError('Could not load wellness history. Make sure your API is running on localhost:3001.');
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, []);

    const calculateAvg = (attr) => {
        if (!history.length) return 0;

        const count = avgRange === '7d' ? 7 : 30;
        const recent = history.slice(-count);
        return averageScores(recent.map((entry) => clampScore(entry[attr])));
    };

    const metrics = {
        sleep: calculateAvg('sleep'),
        stressBalance: calculateAvg('stressBalance'),
        energy: calculateAvg('energy'),
        motivation: calculateAvg('motivation'),
        mood: calculateAvg('mood'),
    };

    const overallIndex = averageScores(Object.values(metrics));
    const displayName = accounts[0]?.name?.split(' ')[0] || 'Student';
    const latestEntry = history[history.length - 1];

    if (loading) {
        return <div className="hub-loader"><div className="hub-spinner"></div><p>Syncing App...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="hub-tag">
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="var(--nscc-teal)"><path d="M7 0L0 3V7C0 10.3 3.1 13.3 7 14C10.9 13.3 14 10.3 14 7V3L7 0Z" opacity="0.8" /></svg>
                        <span>Student Wellness App</span>
                    </div>
                    <h1>Student Dashboard</h1>
                    <p className="welcome-sub">Welcome back, {displayName}. Here is your current wellness snapshot.</p>
                </div>

                <div className="header-right">
                    <div className="status-badge">
                        <div className="status-score">{overallIndex.toFixed(1)}</div>
                        <div className="status-label">Overall Index</div>
                    </div>
                </div>
            </header>

            {error && (
                <section className="grid-item" style={{ marginBottom: '24px' }}>
                    <div className="item-inner">
                        <div className="card-label-mini">Connection Status</div>
                        <h3 style={{ marginTop: 0 }}>Wellness history unavailable</h3>
                        <p style={{ marginBottom: 0 }}>{error}</p>
                    </div>
                </section>
            )}

            <main className="dashboard-grid">
                <section className="grid-item priority-action">
                    <div className="item-inner" style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div>
                                <div className="card-label-mini" style={{ marginBottom: '2px' }}>Action Required</div>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>Wellness Check-In</h3>
                            </div>

                            <button className="btn btn-primary btn-sm" onClick={() => navigate('/tracker')} style={{ padding: '6px 16px', fontSize: '11px', minWidth: 'fit-content' }}>
                                Open Tracker &nbsp; →
                            </button>
                        </div>

                        <p style={{ marginTop: '8px', marginBottom: 0, fontSize: '13px' }}>
                            {latestEntry
                                ? `Last entry recorded on ${formatShortDate(latestEntry.date)}. Add a new check-in to keep your trend up to date.`
                                : 'Start your first check-in to begin building your wellness history.'}
                        </p>
                    </div>
                </section>

                <section className="grid-item pillars-view">
                    <div className="item-inner">
                        <div className="section-head-with-controls">
                            <h2 className="section-title">Core Metrics</h2>
                            <div className="dashboard-controls">
                                <div className="segment-toggle">
                                    <button className={avgRange === '7d' ? 'active' : ''} onClick={() => setAvgRange('7d')}>7 Day</button>
                                    <button className={avgRange === '30d' ? 'active' : ''} onClick={() => setAvgRange('30d')}>Monthly</button>
                                </div>
                            </div>
                        </div>

                        <div className="pillars-container-b2b">
                            <div className="pillars-b2b-grid">
                                {Object.entries(METRIC_DEETS).map(([key, deet]) => {
                                    const avg = metrics[key];

                                    return (
                                        <div key={key} className="pillar-box" onClick={() => navigate('/tracker')}>
                                            <div className="pillar-header">
                                                <span className="p-title-small">{deet.title}</span>
                                                <button className="info-trigger" onClick={(event) => { event.stopPropagation(); setShowInfo(key); }}>i</button>
                                            </div>

                                            <div className="pillar-body">
                                                <PillarProgressBar val={avg} color={deet.color} label={`${avgRange === '7d' ? '7D' : '30D'} Average`} />
                                                <MiniPillarBarChart history={history} attr={key} color={deet.color} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid-item trend-view">
                    <div className="item-inner">
                        <div className="card-label-mini">Health Analytics</div>
                        <h3>Wellbeing Trend</h3>
                        <MonthlyProgressionChart data={history} />
                    </div>
                </section>
            </main>

            <Modal show={!!showInfo} onHide={() => setShowInfo(null)} centered contentClassName="professional-modal">
                <Modal.Body>
                    <div className="prof-modal-header">
                        <h3>{showInfo && METRIC_DEETS[showInfo].title}</h3>
                    </div>

                    <div className="prof-modal-content">
                        <label>Quantitative Metric</label>
                        <p>{showInfo && METRIC_DEETS[showInfo].metric}</p>
                        <label>Research Rationale</label>
                        <p>{showInfo && METRIC_DEETS[showInfo].why}</p>
                        <label>Sources & Evidence</label>
                        <p style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' }}>{showInfo && METRIC_DEETS[showInfo].source}</p>
                    </div>

                    <button className="btn btn-primary btn-full" onClick={() => setShowInfo(null)}>Close</button>
                </Modal.Body>
            </Modal>
        </div>
    );
}
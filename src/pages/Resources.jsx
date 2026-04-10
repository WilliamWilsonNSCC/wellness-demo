import { useEffect, useMemo, useState } from 'react';
import '../resources.css';

const API_URL = 'http://localhost:3001/api/wellness';

const CAMPUS_RESOURCES = {
    ivany: {
        name: 'Ivany (Dartmouth)',
        counselling: 'Student Services and advising support are available on-site at Ivany Campus.',
        peerSupport: 'Connect with the Ivany Student Association and Student Services team for campus events and peer connection.',
    },
    akerley: {
        name: 'Akerley (Dartmouth)',
        counselling: 'Student Services and advising support are available on-site at Akerley Campus.',
        peerSupport: 'Connect with the Akerley Student Association for student-led supports, events, and campus community.',
    },
    kingstec: {
        name: 'Kingstec (Kentville)',
        counselling: 'Student Services and advising support are available on-site at Kingstec Campus.',
        peerSupport: 'Connect with the Kingstec Student Association and Student Services for local student supports.',
    },
};

const getEntryDate = (entry) => entry?.date || entry?.created_at || null;

const formatShortDate = (value) => {
    if (!value) return 'recently';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'recently';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const clampScore = (value) => Math.max(0, Math.min(10, Number(value) || 0));

function buildInsight(entry) {
    if (!entry) {
        return 'Your well-being matters. Explore the supports below whenever you need practical help, connection, or a reset.';
    }

    const stress = clampScore(entry.stress);
    const sleep = clampScore(entry.sleep);
    const energy = clampScore(entry.energy);
    const mood = clampScore(entry.mood);
    const motivation = clampScore(entry.motivation);

    if (stress >= 8) {
        return 'Your latest check-in suggests stress is running high. Counselling, Good2Talk, or a quick connection with Student Services could help you offload some pressure.';
    }
    if (sleep <= 4) {
        return 'Your recent check-in points to lower sleep quality. A lighter schedule, short recovery breaks, and wellness supports may help you rebuild energy.';
    }
    if (energy <= 4 || motivation <= 4) {
        return 'Your current energy or motivation looks a bit low. Consider reaching out for student support and using one small next step today instead of trying to solve everything at once.';
    }
    if (mood <= 4) {
        return 'Your latest mood score suggests things may feel heavy right now. You do not have to navigate that alone—support options below are available when you need them.';
    }

    return 'Your latest check-in shows a fairly stable foundation. Keep the momentum going by staying connected with supports before stress builds up.';
}

export default function Resources() {
    const [wellnessData, setWellnessData] = useState(null);
    const [insight, setInsight] = useState('');
    const [loadingInsight, setLoadingInsight] = useState(true);
    const [campusId, setCampusId] = useState('');

    useEffect(() => {
        const fetchLatestEntry = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const entries = await response.json();
                if (!Array.isArray(entries) || entries.length === 0) {
                    setInsight(buildInsight(null));
                    return;
                }

                const latestEntry = [...entries].sort((a, b) => new Date(getEntryDate(b)) - new Date(getEntryDate(a)))[0];
                setWellnessData(latestEntry);
                setInsight(buildInsight(latestEntry));
            } catch (error) {
                console.error('Could not load wellness data for resources:', error);
                setInsight(buildInsight(null));
            } finally {
                setLoadingInsight(false);
            }
        };

        fetchLatestEntry();
    }, []);

    const campusResources = useMemo(() => CAMPUS_RESOURCES[campusId] || null, [campusId]);

    return (
        <div className="resources-page">
            <header className="resources-header">
                <div>
                    <div className="resources-eyebrow">Student Support</div>
                    <h1>Support & Resources</h1>
                    <p>
                        You are not alone. These resources can help with stress, crisis response, counselling,
                        belonging, and practical next steps.
                    </p>
                </div>
            </header>

            <section className="resources-hero-card">
                <div>
                    <h2>NSCC Student Wellness Hub</h2>
                    <p>The official central tool for your student wellness journey and support information.</p>
                </div>
                <a
                    href="https://nscc.sharepoint.com/sites/Student_Wellness_Hub"
                    target="_blank"
                    rel="noreferrer"
                    className="r-btn primary"
                >
                    Visit Student Wellness Hub ↗
                </a>
            </section>

            <section className="res-card insight-card">
                <div className="r-header">
                    <h3>Self-Care Insight</h3>
                    {wellnessData && <span className="r-badge">From {formatShortDate(getEntryDate(wellnessData))}</span>}
                </div>
                <p className="insight-copy">
                    {loadingInsight ? 'Reviewing your latest wellness check-in...' : insight}
                </p>
                {wellnessData && (
                    <div className="insight-metrics">
                        <span>Mood {clampScore(wellnessData.mood)}</span>
                        <span>Stress {clampScore(wellnessData.stress)}</span>
                        <span>Energy {clampScore(wellnessData.energy)}</span>
                        <span>Sleep {clampScore(wellnessData.sleep)}</span>
                    </div>
                )}
            </section>

            <section className="res-card campus-card">
                <div className="campus-row">
                    <label htmlFor="campus-select">Local Support for:</label>
                    <select id="campus-select" value={campusId} onChange={(e) => setCampusId(e.target.value)}>
                        <option value="">Select your campus...</option>
                        <option value="ivany">Ivany (Dartmouth)</option>
                        <option value="akerley">Akerley (Dartmouth)</option>
                        <option value="kingstec">Kingstec (Kentville)</option>
                    </select>
                </div>
                {campusResources && <p className="campus-summary">Showing campus-specific notes for {campusResources.name}.</p>}
            </section>

            <section className="resources-grid">
                <article className="res-card urgent">
                    <div className="r-header">
                        <div>
                            <h3>Need Help Now?</h3>
                            <span className="r-badge emergency">24/7</span>
                        </div>
                        <a href="tel:988" className="r-btn primary">Call 988 →</a>
                    </div>
                    <p>If you or someone else is in immediate danger or needs support, please reach out using one of these immediate support options.</p>
                    <div className="r-links">
                        <a href="https://988.ca" target="_blank" rel="noreferrer" className="r-btn primary">Suicide Crisis Helpline</a>
                        <a href="https://mha.nshealth.ca/en/services/information-and-support-telephone-lines" target="_blank" rel="noreferrer" className="r-btn outline">NS Mental Health Crisis Line</a>
                        <a href="https://good2talk.ca/novascotia/" target="_blank" rel="noreferrer" className="r-btn outline">Good2Talk Nova Scotia</a>
                    </div>
                </article>

                <article className="res-card">
                    <div className="r-header">
                        <h3>NSCC Advising & Counselling</h3>
                        <a
                            href="https://connect.nscc.ca/student/supports-and-services/health-and-wellness/wellness-and-counselling/counselling/find-a-counsellor.aspx"
                            target="_blank"
                            rel="noreferrer"
                            className="r-btn primary"
                        >
                            Book Appointment →
                        </a>
                    </div>
                    <p>Book a confidential session with an NSCC counsellor or learn more about wellness support through Student Services.</p>
                    {campusResources?.counselling && <div className="resource-note"><strong>Local Office:</strong> {campusResources.counselling}</div>}
                    <div className="r-links">
                        <a href="https://connect.nscc.ca/student/supports-and-services/health-and-wellness/wellness-and-counselling/counselling/find-a-counsellor.aspx" target="_blank" rel="noreferrer" className="r-btn primary">Find a Counsellor</a>
                        <a href="https://www.nscc.ca/student-experience/student-supports/index.asp" target="_blank" rel="noreferrer" className="r-btn outline">Student Supports</a>
                    </div>
                </article>

                <article className="res-card">
                    <div className="r-header">
                        <h3>Substance Use & Recovery Support</h3>
                        <a href="https://nscc.sharepoint.com/sites/Student_Wellness_Hub/SitePages/Substance-Abuse.aspx" target="_blank" rel="noreferrer" className="r-btn primary">Find Support →</a>
                    </div>
                    <p>Access NSCC and community support for substance use, recovery, and harm reduction information.</p>
                    <div className="r-links">
                        <a href="https://nscc.sharepoint.com/sites/Student_Wellness_Hub/SitePages/Substance-Abuse.aspx" target="_blank" rel="noreferrer" className="r-btn outline">NSCC Substance Use Support</a>
                    </div>
                </article>

                <article className="res-card">
                    <div className="r-header">
                        <h3>Peer & Community Support</h3>
                    </div>
                    <p>Build belonging through student groups, peer connection, and campus-based cultural supports.</p>
                    {campusResources?.peerSupport && <div className="resource-note"><strong>Student Association:</strong> {campusResources.peerSupport}</div>}
                    <div className="r-links">
                        <a href="www.nsccstudentassociation.ca" target="_blank" rel="noreferrer" className="r-btn outline">NSCC Student Association</a>
                        <a href="https://www.nscc.ca/student-experience/cultural-supports/2slgbtq-student-supports.asp" target="_blank" rel="noreferrer" className="r-btn outline">2SLGBTQ+ Supports</a>
                        <a href="https://www.nscc.ca/student-experience/cultural-supports/indigenous-student-supports.asp" target="_blank" rel="noreferrer" className="r-btn outline">Indigenous Student Supports</a>
                    </div>
                </article>

                <article className="res-card">
                    <div className="r-header">
                        <h3>Accessibility Support</h3>
                    </div>
                    <p>Get help with accommodations, learning supports, and connecting with Accessibility Services.</p>
                    <div className="r-links">
                        <a href="https://www.nscc.ca/student-experience/student-supports/accessibility-services/accessibility-supports.asp" target="_blank" rel="noreferrer" className="r-btn primary">Accessibility Supports</a>
                        <a href="https://www.nscc.ca/student-experience/student-supports/accessibility-services/contact-accessibility-staff.asp" target="_blank" rel="noreferrer" className="r-btn outline">Contact Accessibility Staff</a>
                    </div>
                </article>
            </section>
        </div>
    );
}
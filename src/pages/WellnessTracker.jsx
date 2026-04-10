import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api/wellness';

function Slider({ label, value, setter }) {
    return (
        <>
            <label>{label}: <strong>{value}</strong></label>
            <input
                type="range"
                min="1"
                max="10"
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
            />
        </>
    );
}

export default function WellnessTracker() {
    const navigate = useNavigate();
    const [mood, setMood] = useState(5);
    const [stress, setStress] = useState(5);
    const [energy, setEnergy] = useState(5);
    const [sleep, setSleep] = useState(5);
    const [motivation, setMotivation] = useState(5);
    const [journal, setJournal] = useState("");
    const [status, setStatus] = useState(null);

    const resetForm = () => {
        setMood(5);
        setStress(5);
        setEnergy(5);
        setSleep(5);
        setMotivation(5);
        setJournal('');
    };

    const updateSlider = (setter) => (value) => {
        if (status !== 'saving') {
            setStatus(null);
        }
        setter(value);
    };

    const handleJournalChange = (e) => {
        if (status !== 'saving') {
            setStatus(null);
        }
        setJournal(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const entry = { mood, stress, energy, sleep, motivation, journal, date: new Date().toISOString() };

        try {
            setStatus('saving');

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry),
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            resetForm();
            setStatus('success');
        } catch (error) {
            console.error('Could not save wellness entry:', error);
            setStatus('error');
        }
    };

    return ( 
        <div className="tracker-container"> 
            <h1>Wellness Tracker</h1>
            <p>Track your mood, sleep, stress, and more.</p>
 
            <form className="tracker-form" onSubmit={handleSubmit}>
                <Slider label="Mood"           value={mood}       setter={updateSlider(setMood)} />
                <Slider label="Stress"         value={stress}     setter={updateSlider(setStress)} />
                <Slider label="Energy"         value={energy}     setter={updateSlider(setEnergy)} />
                <Slider label="Sleep Quality"  value={sleep}      setter={updateSlider(setSleep)} />
                <Slider label="Motivation"     value={motivation} setter={updateSlider(setMotivation)} />
        
                <label>Journal Entry</label>
                <textarea
                placeholder="How are you feeling today?"
                value={journal}
                onChange={handleJournalChange}
                />
        
                <button type="submit" disabled={status === 'saving'}>
                {status === 'saving' ? 'Saving…' : 'Save Entry'}
                </button>
        
                {status === 'success' && (
                    <>
                        <p style={{ color: 'green', marginBottom: '0.5rem' }}>✓ Entry saved!</p>
                        <button type="button" onClick={() => navigate('/')}>
                            Back to Dashboard
                        </button>
                    </>
                )}
                {status === 'error'   && <p style={{ color: 'red'   }}>✗ Could not save — is the API running?</p>}
            </form>
        </div> 
    ); 
}

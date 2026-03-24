import { useState } from 'react';

export default function WellnessTracker() {
    const [mood, setMood] = useState(5);
    const [stress, setStress] = useState(5);
    const [energy, setEnergy] = useState(5);
    const [sleep, setSleep] = useState(5);
    const [motivation, setMotivation] = useState(5);
    const [journal, setJournal] = useState("");
    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const entry = { mood, stress, energy, sleep, motivation, journal, date: new Date().toISOString() };

        await fetch('http://localhost:3001/api/wellness', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
        });
    };

    const Slider = ({ label, value, setter }) => (
        <>
            <label>{label}: <strong>{value}</strong></label>
            <input
                type="range" min="1" max="10" value={value}
                onChange={(e) => setter(e.target.value)}
            />
        </>
    );

    return ( 
        <div className="tracker-container"> 
            <h1>Wellness Tracker</h1>
            <p>Track your mood, sleep, stress, and more.</p>
 
            <form className="tracker-form" onSubmit={handleSubmit}>
                <Slider label="Mood"           value={mood}       setter={setMood} />
                <Slider label="Stress"         value={stress}     setter={setStress} />
                <Slider label="Energy"         value={energy}     setter={setEnergy} />
                <Slider label="Sleep Quality"  value={sleep}      setter={setSleep} />
                <Slider label="Motivation"     value={motivation} setter={setMotivation} />
        
                <label>Journal Entry</label>
                <textarea
                placeholder="How are you feeling today?"
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                />
        
                <button type="submit" disabled={status === 'saving'}>
                {status === 'saving' ? 'Saving…' : 'Save Entry'}
                </button>
        
                {status === 'success' && <p style={{ color: 'green' }}>✓ Entry saved!</p>}
                {status === 'error'   && <p style={{ color: 'red'   }}>✗ Could not save — is the API running?</p>}
            </form>
        </div> 
    ); 
}

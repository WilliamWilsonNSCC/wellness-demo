import { useState } from 'react';

export default function WellnessTracker() {
    const [mood, setMood] = useState(5);
    const [stress, setStress] = useState(5);
    const [energy, setEnergy] = useState(5);
    const [sleep, setSleep] = useState(5);
    const [motivation, setMotivation] = useState(5);
    const [journal, setJournal] = useState("");

    const handleSubmit = (e) => {
        // e.preventDefault();
        const entry = {
            mood,
            stress,
            energy,
            sleep,
            motivation,
            journal,
            date: new Date().toISOString()
        };

        console.log("Wellness Entry: ".entry);

        //later: send to backend
    };

    return ( 
        <div className="tracker-container"> 
            <h1>Wellness Tracker</h1> 
            <p>Track your mood, sleep, stress, and more.</p>
            <form className="tracker-form" onSubmit={handleSubmit}>
                <label>Mood: {mood}</label>
                <input type="range" min="1" max="10" value={mood} onChange={(e) => setMood(e.target.value)}/>
                
                <label>Stress: {stress}</label>
                <input type="range" min="1" max="10" value={stress} onChange={(e) => setStress(e.target.value)}/>
                
                <label>Energy: {energy}</label>
                <input type="range" min="1" max="10" value={energy} onChange={(e) => setEnergy(e.target.value)}/>
                
                <label>Sleep Quality: {sleep}</label>
                <input type="range" min="1" max="10" value={sleep} onChange={(e) => setSleep(e.target.value)}/>

                <label>Motivation: {motivation}</label>
                <input type="range" min="1" max="10" value={motivation} onChange={(e) => setMotivation(e.target.value)}/>
                
                <label>Journal Entry</label>
                <textarea
                placeholder="How are you feeling today?"
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                />

                <button type="submit">Save Entry</button>

            </form>
        </div> 
    ); 
}
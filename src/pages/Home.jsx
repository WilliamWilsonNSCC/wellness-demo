import { useEffect, useState } from 'react';

function scoreColor(val){
    if(val >= 7) return '#2e7d32'; // green
    if(val >= 4) return '#f57c00'; //amber
    return '#c62828';              // red
}

function StatCard({ label, value }) {
    return(
        <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '1.2rem 1.5rem',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            minWidth: 110,
        }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: scoreColor(value) }}>
                { value }
            </div>
            <div style={{ fontSize: '0.85rem', color: '#555', marginTop: 4 }}>
                { label }
            </div>
        </div>
    )
}



export default function Home() {
    const [data, setData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/api/wellness')
            .then(r => r.json())
            .then(setEntries)
            .catch(err => console.error('Failed to fetch entries:', err))
    }, []);

    // if (loading) return <div style={{ 
    //     padding: '3rem', 
    //     textAlign: 'center' 
    // }}>Loading your dashboard…</div>;
    // if (error)   return (
    //     <div style={{ 
    //         padding: '3rem', 
    //         textAlign: 'center', 
    //         color: '#c62828' 
    //     }}>
    //     <p>Could not reach the API. Make sure <code>wellness-api</code> is running on port 3001.</p>
    //     <code>{error}</code>
    //     </div>
    // );

    // return ( 
    //     <div> 
    //         <h1>Welcome to the Wellness Tracker</h1> 
    //         <p>Your journey to better health starts here.</p> 
    //     </div> 
    // ); 

    return (
        
        <div style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
            <h1>Welcome to the Wellness Tracker</h1>
            {entries.length === 0
                ? <p>No entries yet? — Sign in to create one!</p>
                : entries.map(e => (
                    <div key={e.id}>
                    <p>Mood: {e.mood} | Energy: {e.energy} | Sleep: {e.sleep}</p>
                    <p>{e.journal}</p>
                    </div>
                ))
            }
        </div>
    );
}
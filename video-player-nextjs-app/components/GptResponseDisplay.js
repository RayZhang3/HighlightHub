import React, { useEffect, useState } from 'react';

const GptResponseDisplay = ({ prompt }) => {
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!prompt) return;

        setIsLoading(true);
        fetch('/api/gpt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        })
        .then(response => response.text())
        .then(data => {
            setIsLoading(false);
            setResponse(data);
        })
        .catch(err => {
            setIsLoading(false);
            setError('Failed to fetch response from GPT: ' + err.message);
        });
    }, [prompt]);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h3>GPT Response</h3>
            <p>{response}</p>
        </div>
    );
};

export default GptResponseDisplay;
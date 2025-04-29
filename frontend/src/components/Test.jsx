import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function Test() {
    const [hasVisited, setHasVisited] = useState(false);

    useEffect(() => {
        if (!hasVisited) {
            console.log('Welcome to this page for the first time!');
            toast.success('message');
            setHasVisited(true);
        }
    }, [hasVisited]); // The dependency array includes hasVisited so the effect runs when it changes

    return (
        <div>
            <h1>Welcome!</h1>
            <p>This is my component.</p>
        </div>
    );
}

export default Test;
import React, { useState } from 'react';
import './BinaryInput.css';
import '@mui/material/Button';
import Button from '@mui/material/Button';


const BinaryInputField = (props) => {
    const [value, setValue] = useState(props.value || '');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const newValue = e.target.value;
        if (newValue === '' || /^[01\s]+$/.test(newValue)) {
            setValue(newValue);
            setError('');
        } else {
            setError('Input must be a binary string (0 or 1 only)');
        }
    };

    const handleSubmit = () => {
        props.onChange(value);
    }

    return (
        <div className="input-container">
            <label htmlFor="binary-input">Binary Input:</label>
            <textarea
                id="binary-input"
                value={value}
                onChange={handleChange}
                rows="5"
            />
            {error && <p className="error-message">{error}</p>}
            <Button varient="outlined" style={{ backgroundColor: '#a0522d', color: 'white' }} onClick={handleSubmit}>Submit</Button>
        </div>
    );
};

export default BinaryInputField;

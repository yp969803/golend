import React from 'react'

const Spinner = ({ message }) => {
    return (
        <div>
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <h3>{message}</h3>
        </div>
    )
}

export default Spinner
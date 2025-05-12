import React from 'react';
import './MainGraphics.css';
import lineart from '../../assets/line art.jpg';
import pebbleart from '../../assets/pebble art.jpg';
import decorations from '../../assets/decoration.jpg';
import stays from '../../assets/outdoor.jpg';
import dining from '../../assets/dining.jpg';
import rooftop from '../../assets/rooftop.jpg';
import birthdays from '../../assets/birthdays.jpg';
import anniversary from '../../assets/anniversary.jpg';
import proposal from '../../assets/proposal.jpg';
import moviedate from '../../assets/movie date.jpg';
import { useNavigate } from 'react-router-dom';

const MainGraphics = () => {
    const navigate = useNavigate();

    // Array of graphics data with venue types and bestFor
    const graphicsData = [
        { venue: 'rooftop', bestFor: 'any', image: rooftop },
        { venue: 'restaurant', bestFor: 'any', image: dining },
        { venue: 'outdoor', bestFor: 'any', image: stays },
        { venue: 'room', bestFor: 'any', image:decorations  },
        { venue: 'any', bestFor: 'birthday', image: birthdays },
        { venue: 'any', bestFor: 'anniversary', image: anniversary },
        { venue: 'any', bestFor: 'proposal', image: proposal },
        { venue: 'any', bestFor: 'movie date', image: moviedate },
    ];

    const handleGraphicClick = (venueType, bestFor) => {
        navigate('/Dining', { state: { venue: venueType, bestFor: bestFor } });
    };

    return (
        <div className="graphics-container">
            <div className="side-graphic left">
                <img src={lineart} alt="Lineart" className="side-image" />
            </div>

            <div className="main-graphics">
                <div className="header">
                    <h2 className="venue-heading">Choose By Venue</h2>
                    <p className="venue-description">Venues that will make your Event Special</p>
                </div>

                <div className="graphics-grid main-graphics-grid">
                    {graphicsData.slice(0, 4).map((item, index) => (
                        <div
                            key={index}
                            className="graphic-item"
                            onClick={() => handleGraphicClick(item.venue, item.bestFor)}
                        >
                            <img src={item.image} alt={item.venue} className="hover-image" />
                            <p>{item.venue.charAt(0).toUpperCase() + item.venue.slice(1)}</p>
                        </div>
                    ))}
                </div>

                <h2 className="customized-text">Customized for your Special Occasions</h2>

                {/* Second Row of Graphics for Packages */}
                <div className="graphics-grid">
                    {graphicsData.slice(4).map((item, index) => (
                        <div
                            key={index + 4} // Adjusting the key for uniqueness
                            className="graphic-item"
                            onClick={() => handleGraphicClick(item.venue, item.bestFor)}
                        >
                            <img src={item.image} alt={item.venue} className="hover-image" />
                            <p>{item.bestFor.charAt(0).toUpperCase() + item.bestFor.slice(1)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="side-graphic right">
                <img src={pebbleart} alt="Pebbleart" className="side-image" />
            </div>
        </div>
    );
};

export default MainGraphics;

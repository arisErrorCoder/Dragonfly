import React, { useState, useEffect } from 'react';
import './Header.css';
import logo from '../../assets/Header/logo.png';
import staysIcon from '../../assets/Header/romantic stays.png';
import diningIcon from '../../assets/Header/romantic dining.png';
import packagesIcon from '../../assets/Header/group packages.png';
import recommendationsIcon from '../../assets/Header/recommendations.png';
import { FaUser, FaSearch } from 'react-icons/fa';
import { FaCartShopping } from "react-icons/fa6";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { fireDB } from '../Login/firebase'; // Import fireDB from firebase.js
import { ref, get } from 'firebase/database'; // Import required functions

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();  
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // Listen for authentication state changes
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Handle search query changes
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        const fetchSearchResults = async () => {
            console.log('Fetching data from the database...');

            try {
                const dbRef = ref(fireDB, 'Diningpackages'); // Reference to 'Diningpackages'
                const snapshot = await get(dbRef); // Fetch data from the database

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    console.log('Raw data from Firebase:', data);

                    // Filter documents where "best_for" matches the search query
                    const results = Object.keys(data)
                        .filter((key) => {
                            const { best_for = '' } = data[key];
                            const isMatch = best_for.toLowerCase().includes(searchQuery.toLowerCase());
                            console.log(`Checking "${best_for}" against query "${searchQuery}":`, isMatch);
                            return isMatch;
                        })
                        .map((key) => ({
                            id: key,
                            ...data[key],
                        }));

                    console.log('Filtered results:', results);
                    setSearchResults(results.length > 0 ? results : []);
                } else {
                    console.log('No data found in Firebase.');
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
            }
        };

        fetchSearchResults();
    }, [searchQuery]);

    const handleNavigation = (path) => {
        navigate(path, { state: { from: location.pathname } });
      };

    const toggleAccountDropdown = () => {
        setShowAccountDropdown(!showAccountDropdown);
    };

    const handleLogout = () => {
        const auth = getAuth();
        signOut(auth)
            .then(() => {
                console.log('Logged out successfully');
                setUser(null);
                navigate('/');
            })
            .catch((error) => {
                console.error('Error logging out: ', error);
            });
    };

    const handleResultClick = (id) => {
        navigate(`/package-inner/${id}`);
        setSearchQuery(''); // Clear the search input
        setSearchResults([]); // Clear the results
    };

    return (
        <>
            <header>
                <div className="header-container">
                    <div className="logo">
                        <Link to="/">
                            <img src={logo} alt="Logo" />
                        </Link>
                    </div>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search packages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FaSearch className="icon" />
                        {searchQuery && (
                            <ul className="search-results">
                                {searchResults.length > 0 ? (
                                    searchResults.map((result) => (
                                        <li
                                            key={result.id}
                                            onClick={() => handleResultClick(result.id)}
                                        >
                                            {result.name || 'Unnamed Package'} (ID: {result.id})
                                        </li>
                                    ))
                                ) : (
                                    <li className="no-results">No results found</li>
                                )}
                            </ul>
                        )}
                    </div>
                    <div className="header-icons">
                        <FaUser className="icon" onClick={toggleAccountDropdown} />
                        <Link to="/cart"><div className="cart-container">
      <FaCartShopping className="icon" />
      <span className="badge">.</span>
    </div></Link>                      
    
    </div>
                    {showAccountDropdown && (
                        <div className="account-dropdown">
                            <div className="arrow-up"></div>
                            <ul>
                                {user && user.uid ? (
                                    <>
                                        <li onClick={() => handleNavigation('/myaccount')}>My Account</li>
                                        <li onClick={handleLogout}>Logout</li>
                                    </>
                                ) : (
                                    <li onClick={() => handleNavigation('/login')}>Login</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </header>
            <nav>
                <ul className="nav-categories">
                    <li onClick={() => handleNavigation('/Dining')}>
                        <img src={diningIcon} alt="Romantic Dining Icon" />
                        Romantic Dining
                    </li>
                    <li onClick={() => handleNavigation('/RomanticStays')}>
                        <img src={staysIcon} alt="Romantic Stays Icon" />
                        Romantic Stays
                    </li>
                    <li onClick={() => handleNavigation('/supriseplanner')}>
                        <img src={packagesIcon} alt="Group Packages Icon" />
                        Dragonfly Surprises
                    </li>
                    <li onClick={() => handleNavigation('/drognflyhotel')}>
                        <img src={recommendationsIcon} alt="Dragonfly Hotel" />
                        Dragonfly Hotel
                    </li>
                </ul>
            </nav>
        </>
    );
};

export default Header;

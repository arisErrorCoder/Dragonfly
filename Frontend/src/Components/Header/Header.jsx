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
import { fireDB } from '../Login/firebase'; // This is your Firestore instance
import { collection, getDocs, query, where } from 'firebase/firestore';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();  
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

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
            if (searchQuery.trim() === '') {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }
    
            setIsSearching(true);
            setSearchResults([]); // Clear previous results immediately
    
            try {
                const collections = ['Diningpackages', 'RomanticStays',];
                let allResults = [];
    
                for (const collectionName of collections) {
                    const querySnapshot = await getDocs(collection(fireDB, collectionName));
                    
                    const results = querySnapshot.docs
                        .filter(doc => {
                            const data = doc.data();
                            const searchFields = [
                                data.name || '',
                                data.best_for || '',
                                data.description || ''
                            ].join(' ').toLowerCase();
                            
                            return searchFields.includes(searchQuery.toLowerCase());
                        })
                        .map(doc => ({
                            id: doc.id,
                            collection: collectionName,
                            ...doc.data()
                        }));
    
                    allResults = [...allResults, ...results];
                }
    
                setSearchResults(allResults);
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(fetchSearchResults, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    // ... rest of your component remains the same ...
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
                setUser(null);
                navigate('/');
            })
            .catch((error) => {
                console.error('Error logging out: ', error);
            });
    };

    const handleResultClick = (result) => {
        let route;
        switch (result.collection) {
            case 'Diningpackages':
                route = `/package-inner/${result.id}`;
                break;
            case 'RomanticStays':
                route = `/romantic-stay-inner/${result.id}`;
                break;
            case 'SurprisePackages':
                route = `/surprise-package-inner/${result.id}`;
                break;
            default:
                route = '/';
        }
        
        navigate(route);
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchFocused(false);
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
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        />
                        <FaSearch className="icon" />
                        {isSearchFocused && searchQuery && (
        <div className="search-results-container">
            <ul className="search-results">
                {isSearching ? (
                    <li className="search-status">Searching...</li>
                ) : searchResults.length > 0 ? (
                    searchResults.map((result) => (
                        <li
                            key={`${result.collection}-${result.id}`}
                            onClick={() => handleResultClick(result)}
                        >
                            <div className="search-result-item">
                                <div className="search-result-name">
                                    {result.name || 'Unnamed Package'}
                                </div>
                                <div className="search-result-category">
                                    {result.collection.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="no-results">No results found</li>
                )}
            </ul>
        </div>
    )}
                    </div>
                    <div className="header-icons">
                        <FaUser className="icon" onClick={toggleAccountDropdown} />
                        <Link to="/cart">
                            <div className="cart-container">
                                <FaCartShopping className="icon" />
                                <span className="badge">.</span>
                            </div>
                        </Link>                      
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
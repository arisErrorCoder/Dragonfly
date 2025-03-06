import React, { useState } from 'react';
import { FaPencilAlt, FaLock} from 'react-icons/fa';
import { IoLogOut } from "react-icons/io5";
import { IoNotifications } from "react-icons/io5";
import EditProfile from '../EditProfile/EditProfile';
import './Sidebar2.css';

const Navigation = ({ children }) => <nav className="navigation">{children}</nav>;
const List = ({ children }) => <ul className="list">{children}</ul>;
const ListItem = ({ children, ...props }) => <li className="list-item" {...props}>{children}</li>;

const Sidebar2 = ({ onBackClick }) => {
    const [showEditProfile, setShowEditProfile] = useState(false);

    const handleEditProfileClick = () => {
        setShowEditProfile(true);
        setShowOrderHistory(false); 
    };

    return (
        <div className="sidebar-container">
            <div className="sidebar2">
                <div className="back-button" onClick={onBackClick}>
                    &larr; Settings
                </div>
                <Navigation>
                    <List>
                        <ListItem onClick={handleEditProfileClick}>
                            <FaPencilAlt style={{ marginRight: '10px' }} /> Edit profile
                        </ListItem>
                        <ListItem>
                            <FaLock style={{ marginRight: '10px' }} /> Security
                        </ListItem>
                        <ListItem>
                            <IoNotifications style={{ marginRight: '10px' }} /> Notifications
                        </ListItem>
                        <ListItem>
                            <IoLogOut style={{ marginRight: '10px', fontSize: '20px' }} /> Logout
                        </ListItem>
                    </List>
                </Navigation>
            </div>
            <div className="content">
                {showEditProfile && <EditProfile />}
            </div>
        </div>
    );
};

export default Sidebar2;

import React from "react";
import "./Sidebar.css";

const Sidebar = ({ onTypeClick }) => {
    const types = ["Straight Style", "Simple Style", "Grid Style", "Grid Animation Style", "Grid Clique Style", "Force Drawer"];
    return (
        <div className="sidebar">
            <div className="sidebar-list">
                {types.map((type) => (
                    <p key={type} className="sidebar-item" onClick={() => onTypeClick(type)}>
                        {type}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
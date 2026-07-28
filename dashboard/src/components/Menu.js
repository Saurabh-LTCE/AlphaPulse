import React, { useEffect, useMemo, useState } from "react";

import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const Menu = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profile, setProfile] = useState({ fullName: "USERID", email: "" });
  const location = useLocation();

  const selectedMenu = useMemo(() => {
    const pathname = location.pathname.toLowerCase();

    if (pathname.includes("/orders")) return 1;
    if (pathname.includes("/holdings")) return 2;
    if (pathname.includes("/positions")) return 3;
    if (pathname.includes("/funds")) return 4;
    if (pathname.includes("/apps")) return 6;
    return 0;
  }, [location.pathname]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/auth/me", {
          withCredentials: true,
        });

        if (!isMounted) {
          return;
        }

        if (data?.status) {
          setProfile({
            fullName: data.fullName || "USERID",
            email: data.email || "",
          });
        } else {
          window.location.href = "http://localhost:3000/login";
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        if (isMounted) {
          window.location.href = "http://localhost:3000/login";
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleProfileClick = () => {
    setIsProfileDropdownOpen((previous) => !previous);
  };

  const avatarLetter = useMemo(() => {
    const source = profile.fullName || profile.email || "U";
    return source.trim().charAt(0).toUpperCase() || "U";
  }, [profile]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:4000/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      window.location.href = "http://localhost:3000/login";
    }
  };

  const handleProfileAction = () => {
    setIsProfileDropdownOpen(false);
  };

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  return (
    <div className="menu-container">
      <img src="bulllogo.png" alt="Logo" style={{ width: "220px" }} />
      <div className="menus">
        <ul>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/"
            >
              <p className={selectedMenu === 0 ? activeMenuClass : menuClass}>
                Dashboard
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/orders"
            >
              <p className={selectedMenu === 1 ? activeMenuClass : menuClass}>
                Orders
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/holdings"
            >
              <p className={selectedMenu === 2 ? activeMenuClass : menuClass}>
                Holdings
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/positions"
            >
              <p className={selectedMenu === 3 ? activeMenuClass : menuClass}>
                Positions
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="funds"
            >
              <p className={selectedMenu === 4 ? activeMenuClass : menuClass}>
                Funds
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/apps"
            >
              <p className={selectedMenu === 6 ? activeMenuClass : menuClass}>
                Apps
              </p>
            </Link>
          </li>
        </ul>
        <hr />
        <div className="profile" onClick={handleProfileClick} style={{ position: "relative" }}>
          <div className="avatar">{avatarLetter}</div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <p className="username">{profile.fullName || "USERID"}</p>
            {profile.email ? (
              <span style={{ fontSize: "0.7rem", color: "rgb(120, 120, 120)", marginTop: "2px" }}>
                {profile.email}
              </span>
            ) : null}
          </div>

          {isProfileDropdownOpen ? (
            <div className="profile-dropdown" onClick={(event) => event.stopPropagation()}>
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }} onClick={handleProfileAction}>
                <div className="profile-dropdown-item">My Profile</div>
              </Link>
              <Link to="/funds" style={{ textDecoration: "none", color: "inherit" }} onClick={handleProfileAction}>
                <div className="profile-dropdown-item">Funds</div>
              </Link>
              <Link to="/apps" style={{ textDecoration: "none", color: "inherit" }} onClick={handleProfileAction}>
                <div className="profile-dropdown-item">Settings</div>
              </Link>
              <div className="profile-dropdown-item profile-dropdown-logout" onClick={handleLogout}>
                Logout
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Menu;
import { Link, Outlet } from "@remix-run/react";

export default function Settings() {
  return (
    <div>
      <h1>Settings</h1>
      <p>This is settings</p>
      <nav>
        <Link to="app">app</Link>
        <br></br>
        <Link to="profile">profile</Link>
      </nav>
      <Outlet></Outlet>
    </div>
  );
}

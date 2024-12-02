import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <ul>
      <li>
        <NavLink to='/'>Home</NavLink>
      </li>
      <li>
        <NavLink to='/state'>State</NavLink>
      </li>
      <li>
        <NavLink to='/render-list'>Render List</NavLink>
      </li>
      <li>
        <NavLink to='/form'>Form</NavLink>
      </li>
    </ul>
  );
}

import { Link } from '@tanstack/react-router'
import { HeaderSearchBar } from './HeaderSearchBar'

const Header = ({ isAuthenticated, user, handleLogout }) => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-lg">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold hover:text-gray-300">MMA-Elo Explorer</Link>
          <ul className="flex space-x-4">
            {/* <li><Link to="/" className="hover:text-gray-300">Home</Link></li> */}

            {isAuthenticated ? (
              <>
                <li><Link to="/events" className="hover:text-gray-300">Events</Link></li>
                <li><Link to="/fighters" className="hover:text-gray-300">Fighters</Link></li>
                {user && <span className="mr-2 text-sm text-gray-300">Welcome, {user.username}</span>}
                <li>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition duration-200 ease-in-out"
                  >
                    Logout
                  </button>
                </li>
                <li><HeaderSearchBar /></li>
              </>
            ) : (
              // Link visible only when NOT authenticated
              <>
                <li><Link to="/login" className="hover:text-gray-300">Login</Link></li>
                <li><Link to="/register" className="hover:text-gray-300">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </header>
  )
}

export default Header
import { useState } from 'react'; // We need this for the search!
import RecipeCard from './components/RecipeCard';

function App() {
  const [searchTerm, setSearchTerm] = useState(""); // Stores what the user types

  const recipes = [
    { id: 1, title: "RST Signature Pasta", category: "Dinner", time: 20 },
    { id: 2, title: "Rosebank Morning Smoothie", category: "Breakfast", time: 5 },
    { id: 3, title: "Harmony Garlic Bread", category: "Appetizer", time: 15 },
  ];

  // This filters the list based on the search term
  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#111827', marginBottom: '10px' }}>Harmony Kitchen 🍳</h1>
        <p style={{ color: '#6b7280' }}>A secure project by RST Innovations</p>
        
        {/* --- SEARCH BAR START --- */}
        <input 
          type="text" 
          placeholder="Search for a recipe..." 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            marginTop: '20px',
            padding: '12px 20px',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '25px',
            border: '2px solid #e5e7eb',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
        {/* --- SEARCH BAR END --- */}
      </header>

      <div className="recipe-grid">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))
        ) : (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#9ca3af' }}>
            No recipes found for "{searchTerm}"
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
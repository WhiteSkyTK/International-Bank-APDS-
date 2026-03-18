export default function RecipeCard({ title, category, time }) {
  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '0.8rem' }}>{category}</div>
      <h3 style={{ margin: '10px 0' }}>{title}</h3>
      <p style={{ color: '#6b7280' }}>🕒 {time} mins</p>
      <button style={{
        width: '100%',
        padding: '10px',
        backgroundColor: '#1f2937',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
      }}>View Recipe</button>
    </div>
  );
}
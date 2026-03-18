const addRecipe = async (recipeData) => {
  // We send the data to your Java Backend API
  const response = await fetch('http://localhost:8080/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipeData), 
  });
  
  if (response.ok) console.log("Recipe added safely via Stored Procedure!");
};
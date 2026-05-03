import fetch from 'node-fetch';

async function getSwaggerDoc() {
  try {
    const response = await fetch('http://localhost:5130/swagger/FoodMove/swagger.json');
    const data = await response.json();
    console.log(JSON.stringify(data.paths['/api/FoodManage/CreateTask'], null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

getSwaggerDoc();
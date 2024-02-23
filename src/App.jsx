import { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [loading, setLoading] = useState(false);
  const [planets, setPlanets] = useState([]);
  const [nextUrl, setNextUrl] = useState("");
  const [prevUrl, setPrevUrl] = useState("");

  useEffect(() => {
    fetchPlanets("https://swapi.dev/api/planets/?format=json");
  }, []);

  const fetchPlanets = async (url) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const data = await response.json();
      setNextUrl(data.next);
      setPrevUrl(data.previous);

      const planetsData = await Promise.all(
        data.results.map(async (planet) => {
          // Fetch residents data for each planet
          const residentsData = await Promise.all(
            planet.residents.map(async (residentUrl) => {
              const residentResponse = await fetch(residentUrl);
              return residentResponse.json();
            })
          );

          // Attach residents data to the planet
          return { ...planet, residents: residentsData };
        })
      );

      setPlanets(planetsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (direction) => {
    if (
      (direction === "next" && nextUrl) ||
      (direction === "prev" && prevUrl)
    ) {
      fetchPlanets(direction === "next" ? nextUrl : prevUrl);
    }
  };

  const renderResidentDetails = (resident) => (
    <div key={resident.name}>
      <h4>{resident.name}</h4>
      <p>Height: {resident.height}</p>
      <p>Mass: {resident.mass}</p>
      <p>Gender: {resident.gender}</p>
    </div>
  );

  const renderPlanetCard = (planet) => (
    <div key={planet.name} className="card card-planet">
      <h2>{planet.name}</h2>
      <h5>Climate: {planet.climate}</h5>
      <h5>Population: {planet.population}</h5>
      <h5>Terrain: {planet.terrain}</h5>
      <h5>Residents:</h5>
      {planet.residents.map((resident) => renderResidentDetails(resident))}
    </div>
  );

  return (
    <div className="App">
      <div className="overlay" style={{ display: loading ? "flex" : "none" }}>
        Loading...
      </div>
      <nav>
        <div className="nav-items">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Star_Wars_Logo.svg/2560px-Star_Wars_Logo.svg.png"
            alt="Logo"
          />
        </div>
      </nav>
      <main>
        <h1 className="main-title">Star Wars Planets</h1>
        <div className="ctn-main">
          {planets.map((planet) => renderPlanetCard(planet))}
        </div>
        <div className="pagination">
          <button onClick={() => handlePageChange("prev")} disabled={!prevUrl}>
            Previous
          </button>
          <button onClick={() => handlePageChange("next")} disabled={!nextUrl}>
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;

import { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [loading, setLoading] = useState(false);
  const [planets, setPlanets] = useState([]);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  useEffect(() => {
    fetchPlanets(`https://swapi.dev/api/planets/?page=${currentPage}`);
  }, [currentPage]);

  const fetchPlanets = async (url) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const data = await response.json();
      setPlanets(data.results);
      setNextPage(data.next);
      setPrevPage(data.previous);
    } catch (error) {
      console.error("Error fetching planets:", error);
      setError("Error fetching planets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchResidents = async (planet) => {
    setLoading(true);
    try {
      const residentsData = await Promise.all(
        planet.residents.map(async (residentUrl) => {
          const response = await fetch(residentUrl);
          return response.json();
        })
      );
      setSelectedPlanet({ ...planet, residents: residentsData });
    } catch (error) {
      console.error("Error fetching residents:", error);
      setError("Error fetching residents. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (direction) => {
    if (direction === "next" && nextPage) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && prevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleBackToPlanets = () => {
    setSelectedPlanet(null);
  };

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
        {error ? (
          <p>{error}</p>
        ) : (
          <>
            {selectedPlanet ? (
              <>
                <h1 className="main-title">
                  Residents of {selectedPlanet.name}
                </h1>
                <button onClick={handleBackToPlanets} className="backBtn">
                  Back to Planets
                </button>
                <div className="ctn-main">
                  {selectedPlanet.residents.map((resident) => (
                    <div key={resident.name} className="card card-planet">
                      <h3>{resident.name}</h3>
                      <p>Height: {resident.height}</p>
                      <p>Mass: {resident.mass}</p>
                      <p>Gender: {resident.gender}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h1 className="main-title">Star Wars Planets</h1>
                <div className="ctn-main">
                  {planets.map((planet) => (
                    <div key={planet.name} className="card card-planet">
                      <h2>{planet.name}</h2>
                      <p>Climate: {planet.climate}</p>
                      <p>Population: {planet.population}</p>
                      {planet.residents.length > 0 && (
                        <button onClick={() => fetchResidents(planet)}>
                          Click to see residents
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange("prev")}
                    disabled={!prevPage}>
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange("next")}
                    disabled={!nextPage}>
                    Next
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
